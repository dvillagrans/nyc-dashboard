#!/usr/bin/env python3
"""
Extract pre-computed aggregations from NYC FHV parquet → JSON files
for the Next.js dashboard.

Usage:
    python scripts/extract_data.py

Output:
    public/data/summary.json
    public/data/peak_hours.json
    public/data/maps.json
    public/data/uber_vs_lyft.json
    public/data/income.json
    public/data/airports.json
    public/data/ml_mock.json
"""

import json
import os
import pandas as pd
import numpy as np
from pathlib import Path

# --- Config ---
BASE_DIR = Path(__file__).resolve().parent.parent
STREAMLIT_DIR = BASE_DIR.parent / "NYC-Ride-Hailing-Analytics-Dashboard"
PARQUET_PATH = STREAMLIT_DIR / "data_sampled" / "2024-02_reduced.parquet"
ZONES_PATH = STREAMLIT_DIR / "data" / "taxi_zone_lookup.csv"
CENTROIDS_PATH = STREAMLIT_DIR / "data" / "taxi_zone_centroids.csv"
OUTPUT_DIR = BASE_DIR / "public" / "data"

# NYC TLC FHV license codes
OPERATOR_NAMES = {
    "HV0005": "Uber",
    "HV0003": "Lyft",
    "HV0004": "Via",
    "HV0002": "Juno",
}

# Airport location IDs
AIRPORT_ZONES = {1: "Newark (EWR)", 132: "JFK", 138: "LaGuardia (LGA)"}

DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
DAY_MAP = {0: "Lunes", 1: "Martes", 2: "Miércoles", 3: "Jueves", 4: "Viernes", 5: "Sábado", 6: "Domingo"}

INCOME_LABELS = {
    "driver_pay": "Pago al Conductor",
    "tips": "Propinas",
    "base_passenger_fare": "Tarifa Base",
    "tolls": "Peajes",
    "bcf": "Black Car Fund",
    "sales_tax": "Impuesto de Ventas",
    "congestion_surcharge": "Recargo por Congestión",
    "airport_fee": "Tarifa Aeroportuaria",
}

OPERATOR_COLORS = {"Uber": "#276EF1", "Lyft": "#FF00BF"}


def load_data():
    """Load parquet + zone data, derive columns."""
    print("Loading parquet...")
    df = pd.read_parquet(PARQUET_PATH)

    # Map operator codes to names
    df["operator"] = df["hvfhs_license_num"].map(OPERATOR_NAMES).fillna(df["hvfhs_license_num"])

    # Derive temporal columns
    df["pickup_hour"] = df["pickup_datetime"].dt.hour
    df["pickup_weekday"] = df["pickup_datetime"].dt.weekday
    df["day_name"] = df["pickup_weekday"].map(DAY_MAP)
    df["pickup_date"] = df["pickup_datetime"].dt.date.astype(str)

    # Merge with zone lookup
    zones = pd.read_csv(ZONES_PATH)
    centroids = pd.read_csv(CENTROIDS_PATH)
    zones = zones.merge(centroids, on="LocationID", how="left")

    df = df.merge(
        zones[["LocationID", "Borough", "Zone"]].rename(
            columns={"LocationID": "PULocationID", "Borough": "pickup_borough", "Zone": "pickup_zone"}
        ),
        on="PULocationID",
        how="left",
    )
    df = df.merge(
        zones[["LocationID", "Borough", "Zone"]].rename(
            columns={"LocationID": "DOLocationID", "Borough": "dropoff_borough", "Zone": "dropoff_zone"}
        ),
        on="DOLocationID",
        how="left",
    )

    # Airport flags
    df["from_airport"] = df["PULocationID"].isin(AIRPORT_ZONES)
    df["to_airport"] = df["DOLocationID"].isin(AIRPORT_ZONES)

    # Tip percentage
    df["tip_percent"] = np.where(df["driver_pay"] > 0, (df["tips"] / df["driver_pay"]) * 100, 0)

    print(f"Loaded {len(df)} records, {df['operator'].nunique()} operators")
    return df, zones


def extract_summary(df):
    """Tab 1: Resumen General."""
    total_trips = len(df)
    unique_days = df["pickup_datetime"].dt.date.nunique()
    n_operators = df["operator"].nunique()
    total_income = round(df["driver_pay"].sum(), 2)
    avg_daily = round(total_trips / unique_days) if unique_days > 0 else 0
    avg_miles = round(df["trip_miles"].mean(), 2)
    avg_time_min = round(df["trip_time"].mean() / 60, 1)

    # Trips by hour
    by_hour = (
        df.groupby(["pickup_hour", "operator"]).size().reset_index(name="trips")
        .to_dict(orient="records")
    )

    # Trips by weekday
    by_weekday = (
        df.groupby(["day_name", "operator"]).size().reset_index(name="trips")
    )
    by_weekday["day_name"] = pd.Categorical(by_weekday["day_name"], categories=DAY_ORDER, ordered=True)
    by_weekday = by_weekday.sort_values("day_name").to_dict(orient="records")

    # Heatmap: hour x weekday
    heatmap = df.groupby(["pickup_hour", "day_name"]).size().reset_index(name="trips")
    heatmap["day_name"] = pd.Categorical(heatmap["day_name"], categories=DAY_ORDER, ordered=True)
    heatmap = heatmap.sort_values(["pickup_hour", "day_name"])
    heatmap_data = []
    for _, row in heatmap.iterrows():
        heatmap_data.append([DAY_ORDER.index(row["day_name"]), row["pickup_hour"], int(row["trips"])])

    # Daily trend
    daily = df.groupby(["pickup_date", "operator"]).size().reset_index(name="trips")
    daily_trend = daily.to_dict(orient="records")

    # Operator summary
    op_summary = (
        df.groupby("operator")
        .agg(
            trips=("pickup_datetime", "count"),
            income=("driver_pay", "sum"),
            tips=("tips", "sum"),
            avg_miles=("trip_miles", "mean"),
            avg_time=("trip_time", "mean"),
        )
        .reset_index()
    )
    op_summary["tip_avg"] = op_summary["tips"] / op_summary["trips"]
    op_summary["tip_pct"] = (op_summary["tips"] / op_summary["income"]) * 100
    op_summary["avg_time_min"] = op_summary["avg_time"] / 60
    op_records = op_summary.to_dict(orient="records")
    for r in op_records:
        r["income"] = round(r["income"], 2)
        r["tips"] = round(r["tips"], 2)
        r["tip_avg"] = round(r["tip_avg"], 2)
        r["tip_pct"] = round(r["tip_pct"], 1)
        r["avg_miles"] = round(r["avg_miles"], 2)
        r["avg_time_min"] = round(r["avg_time_min"], 1)

    # Borough distribution
    borough_dist = df.groupby("pickup_borough").size().reset_index(name="trips")
    borough_dist = borough_dist.sort_values("trips", ascending=False).to_dict(orient="records")

    return {
        "kpis": {
            "totalTrips": total_trips,
            "uniqueDays": unique_days,
            "operators": n_operators,
            "totalIncome": total_income,
            "avgDailyTrips": avg_daily,
            "avgMiles": avg_miles,
            "avgTimeMin": avg_time_min,
        },
        "byHour": by_hour,
        "byWeekday": by_weekday,
        "heatmap": heatmap_data,
        "dailyTrend": daily_trend,
        "operatorSummary": op_records,
        "boroughDistribution": borough_dist,
    }


def extract_peak_hours(df):
    """Tab 2: Horas Pico."""
    # By hour and operator
    by_hour_op = (
        df.groupby(["pickup_hour", "operator"]).size().reset_index(name="trips")
        .to_dict(orient="records")
    )

    # By weekday and operator
    by_weekday_op = df.groupby(["day_name", "operator"]).size().reset_index(name="trips")
    by_weekday_op["day_name"] = pd.Categorical(by_weekday_op["day_name"], categories=DAY_ORDER, ordered=True)
    by_weekday_op = by_weekday_op.sort_values("day_name").to_dict(orient="records")

    # Top 15 zones by operator
    top_zones = df.groupby("pickup_zone").size().nlargest(15).index.tolist()
    zone_op = (
        df[df["pickup_zone"].isin(top_zones)]
        .groupby(["pickup_zone", "operator"])
        .size()
        .reset_index(name="trips")
        .to_dict(orient="records")
    )

    # Hot spots: hour x weekday
    hotspot = df.groupby(["pickup_hour", "day_name"]).size().reset_index(name="trips")
    hotspot["day_name"] = pd.Categorical(hotspot["day_name"], categories=DAY_ORDER, ordered=True)
    hotspot = hotspot.sort_values(["pickup_hour", "day_name"])
    hotspot_data = []
    for _, row in hotspot.iterrows():
        hotspot_data.append([DAY_ORDER.index(row["day_name"]), row["pickup_hour"], int(row["trips"])])

    return {
        "byHourOperator": by_hour_op,
        "byWeekdayOperator": by_weekday_op,
        "topZonesOperator": zone_op,
        "hotspots": hotspot_data,
        "topZoneNames": top_zones,
    }


def extract_maps(df, zones):
    """Tab 3: Mapas."""
    # Zone trip counts with coordinates
    zone_counts = (
        df.groupby(["pickup_zone", "pickup_borough"])
        .size()
        .reset_index(name="trip_count")
        .sort_values("trip_count", ascending=False)
    )

    # Merge with centroids
    centroids = pd.read_csv(CENTROIDS_PATH)
    zone_geo = zone_counts.merge(
        zones[["LocationID", "Zone"]].rename(columns={"Zone": "pickup_zone"}),
        on="pickup_zone",
        how="left",
    ).merge(centroids, on="LocationID", how="left")

    zone_features = []
    for _, row in zone_geo.iterrows():
        if pd.notna(row.get("latitude")) and pd.notna(row.get("longitude")):
            zone_features.append({
                "zone": row["pickup_zone"],
                "borough": row["pickup_borough"],
                "trips": int(row["trip_count"]),
                "lat": float(row["latitude"]),
                "lon": float(row["longitude"]),
            })

    # Top 20 flows
    flows = (
        df.groupby(["pickup_zone", "dropoff_zone"])
        .size()
        .reset_index(name="trip_count")
        .sort_values("trip_count", ascending=False)
        .head(20)
    )
    flow_records = flows.to_dict(orient="records")

    # Unique zones for Sankey
    flow_zones = list(set([f["pickup_zone"] for f in flow_records] + [f["dropoff_zone"] for f in flow_records]))

    return {
        "zoneFeatures": zone_features,
        "flows": flow_records,
        "flowZones": flow_zones,
    }


def extract_uber_vs_lyft(df):
    """Tab 4: Uber vs Lyft."""
    ul = df[df["operator"].isin(["Uber", "Lyft"])]
    if len(ul) == 0:
        return {"hasData": False}

    # Trip distribution
    trip_counts = ul["operator"].value_counts().to_dict()

    # Income distribution
    income_dist = ul.groupby("operator")["driver_pay"].sum().to_dict()

    # Metrics comparison
    metrics = {}
    for op in ["Uber", "Lyft"]:
        subset = ul[ul["operator"] == op]
        metrics[op] = {
            "trips": len(subset),
            "avgFare": round(subset["driver_pay"].mean(), 2),
            "avgTip": round(subset["tips"].mean(), 2),
            "avgMiles": round(subset["trip_miles"].mean(), 2),
            "avgTimeMin": round(subset["trip_time"].mean() / 60, 1),
            "pricePerMile": round(subset["driver_pay"].sum() / subset["trip_miles"].sum(), 2) if subset["trip_miles"].sum() > 0 else 0,
            "pricePerMinute": round(subset["driver_pay"].sum() / (subset["trip_time"].sum() / 60), 2) if subset["trip_time"].sum() > 0 else 0,
        }

    # Tip analysis
    tipped = ul[ul["tips"] > 0].copy()
    tip_analysis = {}
    for op in ["Uber", "Lyft"]:
        op_data = ul[ul["operator"] == op]
        op_tipped = tipped[tipped["operator"] == op]
        tip_analysis[op] = {
            "avgTip": round(op_tipped["tips"].mean(), 2) if len(op_tipped) > 0 else 0,
            "pctTripsWithTip": round(len(op_tipped) / len(op_data) * 100, 1) if len(op_data) > 0 else 0,
            "tipPctOfIncome": round(op_tipped["tips"].sum() / op_data["driver_pay"].sum() * 100, 2) if op_data["driver_pay"].sum() > 0 else 0,
        }

    # Tip distribution histogram
    tipped["tip_pct_bucket"] = (tipped["tip_percent"] // 2 * 2).clip(0, 30)
    tip_hist = (
        tipped.groupby(["tip_pct_bucket", "operator"]).size().reset_index(name="count")
        .to_dict(orient="records")
    )

    # Top zones by operator
    top_zones = ul.groupby("pickup_zone").size().nlargest(10).index.tolist()
    zone_op = (
        ul[ul["pickup_zone"].isin(top_zones)]
        .groupby(["pickup_zone", "operator"])
        .size()
        .reset_index(name="trips")
        .to_dict(orient="records")
    )

    # Market share heatmap by zone
    zone_pivot = ul[ul["pickup_zone"].isin(top_zones)].groupby(["pickup_zone", "operator"]).size().unstack(fill_value=0)
    zone_pivot_pct = zone_pivot.div(zone_pivot.sum(axis=1), axis=0) * 100
    market_heatmap = []
    for zone in zone_pivot_pct.index:
        for op in ["Uber", "Lyft"]:
            if op in zone_pivot_pct.columns:
                market_heatmap.append({"zone": zone, "operator": op, "pct": round(zone_pivot_pct.loc[zone, op], 1)})

    # Hourly patterns
    hourly = ul.groupby(["pickup_hour", "operator"]).size().reset_index(name="trips").to_dict(orient="records")

    # Market share by hour (stacked area)
    hourly_pivot = ul.groupby(["pickup_hour", "operator"]).size().unstack(fill_value=0)
    hourly_pct = hourly_pivot.div(hourly_pivot.sum(axis=1), axis=0) * 100
    market_hourly = []
    for hour in hourly_pct.index:
        for op in ["Uber", "Lyft"]:
            if op in hourly_pct.columns:
                market_hourly.append({"hour": int(hour), "operator": op, "pct": round(hourly_pct.loc[hour, op], 1)})

    # Daily patterns
    daily = ul.groupby(["day_name", "operator"]).size().reset_index(name="trips")
    daily["day_name"] = pd.Categorical(daily["day_name"], categories=DAY_ORDER, ordered=True)
    daily = daily.sort_values("day_name").to_dict(orient="records")

    # Airport comparison
    airport_data = {}
    for direction, col in [("to", "to_airport"), ("from", "from_airport")]:
        airport_trips = ul[ul[col] == True]
        airport_data[direction] = {
            "byOperator": airport_trips.groupby("operator").size().to_dict(),
            "total": len(airport_trips),
        }

    return {
        "hasData": True,
        "tripDistribution": trip_counts,
        "incomeDistribution": income_dist,
        "metrics": metrics,
        "tipAnalysis": tip_analysis,
        "tipHistogram": tip_hist,
        "topZonesOperator": zone_op,
        "marketHeatmap": market_heatmap,
        "hourly": hourly,
        "marketHourly": market_hourly,
        "daily": daily,
        "airport": airport_data,
    }


def extract_income(df):
    """Tab 5: Ingresos."""
    income_cols = ["driver_pay", "tips", "base_passenger_fare", "tolls", "bcf", "sales_tax", "congestion_surcharge", "airport_fee"]
    available = [c for c in income_cols if c in df.columns]

    # Totals
    totals = {INCOME_LABELS.get(c, c): round(df[c].sum(), 2) for c in available}

    # Composition (donut)
    composition = [{"name": INCOME_LABELS.get(c, c), "value": round(df[c].sum(), 2)} for c in available]

    # By company (stacked bar)
    by_company = df.groupby("operator")[available].sum().reset_index()
    by_company_records = []
    for _, row in by_company.iterrows():
        rec = {"operator": row["operator"]}
        for c in available:
            rec[INCOME_LABELS.get(c, c)] = round(row[c], 2)
        by_company_records.append(rec)

    # Daily trend
    daily = df.groupby(["pickup_date", "operator"])["driver_pay"].sum().reset_index()
    daily.columns = ["date", "operator", "income"]
    daily["income"] = daily["income"].round(2)
    daily_trend = daily.to_dict(orient="records")

    # Scatter: fare vs tips (sample for performance)
    scatter_df = df[["driver_pay", "tips", "operator"]].copy()
    if len(scatter_df) > 500:
        scatter_df = scatter_df.sample(500, random_state=42)
    scatter = scatter_df.to_dict(orient="records")

    # Tip % histogram
    valid = df[(df["tip_percent"] > 0) & (df["tip_percent"] <= 30)].copy()
    valid["bucket"] = (valid["tip_percent"] // 2 * 2).astype(int)
    tip_hist = valid.groupby(["bucket", "operator"]).size().reset_index(name="count").to_dict(orient="records")

    return {
        "totals": totals,
        "composition": composition,
        "byCompany": by_company_records,
        "dailyTrend": daily_trend,
        "scatter": scatter,
        "tipHistogram": tip_hist,
    }


def extract_airports(df):
    """Tab 6: Aeropuertos."""
    to_airport = df[df["to_airport"] == True]
    from_airport = df[df["from_airport"] == True]
    all_airport = df[(df["to_airport"]) | (df["from_airport"])]
    total = len(df)

    # KPIs
    kpis = {
        "toAirport": len(to_airport),
        "fromAirport": len(from_airport),
        "totalAirport": len(all_airport),
        "toPct": round(len(to_airport) / total * 100, 1),
        "fromPct": round(len(from_airport) / total * 100, 1),
        "totalPct": round(len(all_airport) / total * 100, 1),
        "avgFare": round(all_airport["driver_pay"].mean(), 2) if len(all_airport) > 0 else 0,
    }

    # Helper for direction analysis
    def direction_data(trips, direction):
        if len(trips) == 0:
            return {"count": 0}
        avg_miles = round(trips["trip_miles"].mean(), 2)
        avg_fare = round(trips["driver_pay"].mean(), 2)
        avg_miles_all = round(df["trip_miles"].mean(), 2)
        avg_fare_all = round(df["driver_pay"].mean(), 2)

        # By operator
        by_op = trips.groupby("operator").size().to_dict()

        # Hourly
        hourly = trips.groupby("pickup_hour").size().reset_index(name="trips")
        hourly_general = df.groupby("pickup_hour").size().reset_index(name="total")
        hourly = hourly.merge(hourly_general, on="pickup_hour", how="right").fillna(0)
        hourly["pct"] = (hourly["trips"] / hourly["total"] * 100).round(1)
        hourly_records = hourly[["pickup_hour", "trips", "pct"]].to_dict(orient="records")

        # Airport distribution
        loc_col = "DOLocationID" if direction == "to" else "PULocationID"
        airport_dist = []
        for loc_id, name in AIRPORT_ZONES.items():
            count = len(trips[trips[loc_col] == loc_id])
            if count > 0:
                airport_dist.append({"airport": name, "trips": int(count)})
        total_airport_trips = sum(a["trips"] for a in airport_dist)
        for a in airport_dist:
            a["pct"] = round(a["trips"] / total_airport_trips * 100, 1) if total_airport_trips > 0 else 0

        return {
            "count": len(trips),
            "avgMiles": avg_miles,
            "avgMilesDelta": round(avg_miles - avg_miles_all, 2),
            "avgFare": avg_fare,
            "avgFareDelta": round(avg_fare - avg_fare_all, 2),
            "byOperator": by_op,
            "hourly": hourly_records,
            "airportDistribution": airport_dist,
        }

    # Weekly trend
    to_daily = to_airport.groupby("day_name").size().reset_index(name="to_trips")
    from_daily = from_airport.groupby("day_name").size().reset_index(name="from_trips")
    weekly = to_daily.merge(from_daily, on="day_name", how="outer").fillna(0)
    weekly["day_name"] = pd.Categorical(weekly["day_name"], categories=DAY_ORDER, ordered=True)
    weekly = weekly.sort_values("day_name").to_dict(orient="records")

    # Fare comparison (box plot data)
    fare_stats = {}
    for label, trips in [("to", to_airport), ("from", from_airport)]:
        if len(trips) > 0:
            fares = trips["driver_pay"]
            fare_stats[label] = {
                "min": round(fares.min(), 2),
                "q1": round(fares.quantile(0.25), 2),
                "median": round(fares.median(), 2),
                "q3": round(fares.quantile(0.75), 2),
                "max": round(fares.max(), 2),
                "mean": round(fares.mean(), 2),
            }

    return {
        "kpis": kpis,
        "toAirport": direction_data(to_airport, "to"),
        "fromAirport": direction_data(from_airport, "from"),
        "weeklyTrend": weekly,
        "fareComparison": fare_stats,
    }


def extract_ml_mock():
    """Tab 7: Mock ML data."""
    return {
        "models": [
            {"name": "driver_pay_rf", "type": "Random Forest", "performance": 0.847},
            {"name": "driver_pay_lgb", "type": "LightGBM", "performance": 0.862},
            {"name": "airport_rf", "type": "Random Forest", "performance": 0.912},
            {"name": "airport_lgb", "type": "LightGBM", "performance": 0.925},
        ],
        "featureImportance": [
            {"feature": "trip_miles", "importance": 0.35},
            {"feature": "trip_time", "importance": 0.28},
            {"feature": "pickup_hour", "importance": 0.12},
            {"feature": "PULocationID", "importance": 0.09},
            {"feature": "DOLocationID", "importance": 0.07},
            {"feature": "pickup_weekday", "importance": 0.05},
            {"feature": "hvfhs_license_num", "importance": 0.04},
        ],
        "samplePrediction": {
            "input": {"trip_miles": 5.0, "trip_time": 900, "pickup_hour": 14, "operator": "Uber"},
            "predicted_fare": 22.45,
            "confidence": 0.87,
        },
    }


def save_json(data, filename):
    """Save dict to JSON file."""
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, default=str)
    size = path.stat().st_size
    print(f"  ✓ {filename} ({size:,} bytes)")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df, zones = load_data()

    print("\nExtracting data...")
    save_json(extract_summary(df), "summary.json")
    save_json(extract_peak_hours(df), "peak_hours.json")
    save_json(extract_maps(df, zones), "maps.json")
    save_json(extract_uber_vs_lyft(df), "uber_vs_lyft.json")
    save_json(extract_income(df), "income.json")
    save_json(extract_airports(df), "airports.json")
    save_json(extract_ml_mock(), "ml_mock.json")

    print(f"\nDone! {len(list(OUTPUT_DIR.glob('*.json')))} JSON files in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
