export default function Entry({
  data: { entryDescription, entry },
}: {
  data: { entryDescription: string; entry: any[] };
}) {
  return (
    <table className="table-auto mb-8 border-collapse border border-zinc-500">
      <thead>
        <tr>
          <th className="border border-zinc-500">Date</th>
          <th className="border border-zinc-500">Account Description</th>
          <th className="border border-zinc-500">Dr</th>
          <th className="border border-zinc-500">Cr</th>
        </tr>
      </thead>
      <tbody>
        {entry.map((rowData, index) => {
          return (
            <tr key={index}>
              <td className="border border-zinc-500">{rowData.date}</td>
              <td className="border border-zinc-500">{rowData.account}</td>
              <td className="border border-zinc-500">
                {rowData.Dr ? '$' + (rowData.Dr / 100).toFixed(2) : ''}
              </td>
              <td className="border border-zinc-500">
                {rowData.Cr ? '$' + (rowData.Cr / 100).toFixed(2) : ''}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={4}>{entryDescription}</td>
        </tr>
      </tbody>
    </table>
  );
}
