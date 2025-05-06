export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { InfluxDB } from '@influxdata/influxdb-client';

const org    = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

type Row = { lat: number; lon: number; stress: number; time: string };

export async function GET() {
    const { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET } = process.env;

    if (!INFLUX_URL || !INFLUX_TOKEN || !INFLUX_ORG || !INFLUX_BUCKET) {
        console.error('[API] Missing env', { INFLUX_URL, INFLUX_ORG, INFLUX_BUCKET });
        return NextResponse.json({ error: 'Influx env vars missing' }, { status: 500 });
    }

    const influx = new InfluxDB({
        url: process.env.INFLUX_URL!,
        token: process.env.INFLUX_TOKEN!,
      });
    const queryApi = influx.getQueryApi(org);

    const flux = `
    from(bucket: "${bucket}")
        |> range(start: -12h)
        |> filter(fn: (r) => r._measurement == "gps")     //  ← fixed
        |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
        |> keep(columns: ["_time","lat","lon","stress"])
        |> sort(columns: ["_time"], desc:true)
        |> limit(n:500)
    `;
    
    const rows: Row[] = [];

    return new Promise<NextResponse>((resolve, reject) => {
        queryApi.queryRows(flux, {
          next: (row, meta) => {
            const o = meta.toObject(row) as any;
            rows.push({
              lat: +o.lat,
              lon: +o.lon,
              stress: +o.stress,
              time: o._time,
            });
          },
          error: reject,
          complete: () => resolve(NextResponse.json(rows)),
        });
      });
  }
  