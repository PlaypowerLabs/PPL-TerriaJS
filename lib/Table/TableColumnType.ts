enum TableColumnType {
  longitude,
  latitude,
  height,
  time,
  scalar,
  enum,
  region,
  text,
  address,
  hidden
}

export function stringToTableColumnType(
  s: string
): TableColumnType | undefined {
  return TableColumnType[s as keyof typeof TableColumnType];
}

export default TableColumnType;
