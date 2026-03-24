export function CredentialViewer({ data }: { data: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-secondary p-3 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
