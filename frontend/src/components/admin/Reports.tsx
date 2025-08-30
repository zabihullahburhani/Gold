"use client";

import React, { useEffect, useState } from "react";
import { fetchReports } from "../../services/reports_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Report {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetchReports();
        if (res.ok) {
          setReports(res.data);
        } else {
          setError("Failed to fetch reports");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>{report.title}</CardHeader>
          <CardContent>
            <p>{report.description}</p>
            <small className="text-gray-400">{new Date(report.created_at).toLocaleString()}</small>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
