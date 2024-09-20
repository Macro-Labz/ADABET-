import React from 'react';

const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-800">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}
  </tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b border-gray-700">{children}</tr>
);

const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">{children}</th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-2 text-sm text-gray-300">{children}</td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
