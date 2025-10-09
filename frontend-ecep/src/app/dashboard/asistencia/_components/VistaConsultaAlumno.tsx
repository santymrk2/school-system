"use client";
import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAsistenciasData } from "@/hooks/useAsistenciasData";

function Donut({ percent }: { percent: number }) {
  const r = 36,
    c = 2 * Math.PI * r,
    off = c - (Math.max(0, Math.min(100, percent)) / 100) * c;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="transparent"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function VistaConsultaAlumno() {
  const { user, selectedRole } = useAuth();
  const { loading, jornadas, detalles } = useAsistenciasData();

  // Aquí deberías usar identidad.familiaresAlumnos.byFamiliarId(user.personaId) si FAMILY,
  // o la matrícula del propio alumno si STUDENT (con tu endpoint).
  // Para demo: asumimos que ya tenés una matrículaId:
  const [matriculaId] = useState<number | null>(null);

  const detallesAlumno = useMemo(() => {
    if (!matriculaId) return [];
    return detalles.filter((d) => d.matriculaId === matriculaId);
  }, [detalles, matriculaId]);

  const total = detallesAlumno.length || 1;
  const presentes = detallesAlumno.filter(
    (d) => d.estado === "PRESENTE",
  ).length;
  const ausentes = detallesAlumno.filter((d) => d.estado === "AUSENTE").length;
  const pct = Math.round((presentes / total) * 100);

  if (loading) return <LoadingState label="Cargando información…" />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Asistencia</CardTitle>
          <CardDescription>Alumno</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="text-primary">
            <Donut percent={pct} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-secondary" />
              <span>{presentes} presentes</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-error" />
              <span>{ausentes} ausentes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>Fechas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {detallesAlumno
              .map((d) => {
                const j = jornadas.find((j) => j.id === d.jornadaId);
                return { d, fecha: j?.fecha ?? "" };
              })
              .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""))
              .map(({ d, fecha }) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between border rounded p-2"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{fecha?.slice(0, 10)}</Badge>
                  </div>
                  <Badge
                    variant={
                      d.estado === "PRESENTE" ? "default" : "destructive"
                    }
                  >
                    {d.estado}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
