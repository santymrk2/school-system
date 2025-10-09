// src/app/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-600">
        No tenés permisos para acceder a esta sección.
      </h1>
    </div>
  );
}
