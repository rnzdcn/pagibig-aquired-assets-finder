/** Raw shape returned by Pag-IBIG's LoadLocations endpoint. */
export interface RawLocation {
  result_column0: string
  result_column1: string
  result_column2: string | null
  result_column3: string | null
}

export interface LocationOption {
  code: string
  name: string
  parentCode: string | null
}

export function normalizeLocation(raw: RawLocation): LocationOption {
  return {
    code: raw.result_column0,
    name: raw.result_column1,
    parentCode: raw.result_column2,
  }
}
