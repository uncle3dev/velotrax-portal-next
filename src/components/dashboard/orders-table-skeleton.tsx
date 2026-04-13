export function OrdersTableSkeleton() {
  return (
    <div className="overflow-x-auto" aria-busy="true" aria-label="Loading orders">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Order ID", "Customer", "Status", "Amount", "Date"].map((col) => (
              <th
                key={col}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
