/** Raw shape returned by Pag-IBIG's Load_SearchListProperties_COPA endpoint. */
export interface RawProperty {
  batch_no: string
  ropa_id: string
  prop_location: string
  prop_type: string
  tct_cct_no: string
  lot_area: string
  floor_area: string
  min_sellprice: number
  appr_date: string
  req_gross: number
  remarks: string
  status: string
  city_muni: string
  inspection_date: string
  ins_remarks: string
  disposal_flag: string
  start_datetime: string
  end_datetime: string
  status_bid: string
  opening_datetime: string
  disposal_type: string
  subdivision: string
  occupancy: string
  contact_hbc: string
  email_hbc: string
  handling_hbc: string
  is_sale: string | null
  survey_no: string
}

export type AuctionType = '1' | '2' | '3'

export const AUCTION_TYPE_LABELS: Record<AuctionType, string> = {
  '1': 'First Auction',
  '2': 'Second Auction',
  '3': 'Negotiated Sale',
}

/** Normalized, UI-friendly property record derived from RawProperty. */
export interface Property {
  id: string
  batchNo: string
  location: string
  cityMuni: string
  subdivision: string
  propertyType: string
  titleNo: string
  lotArea: number
  floorArea: number
  minBid: number
  appraisalDate: Date | null
  inspectionDate: Date | null
  auctionType: AuctionType
  auctionLabel: string
  startDate: Date | null
  endDate: Date | null
  openingDate: Date | null
  occupancy: string
  remarks: string
  contact: string
  email: string
  handlingUnit: string
  surveyNo: string
  raw: RawProperty
}

function parseNumber(value: string | number | null | undefined): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(value ?? '')
  return Number.isFinite(n) ? n : 0
}

function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeProperty(raw: RawProperty): Property {
  const auctionType = (raw.disposal_flag as AuctionType) in AUCTION_TYPE_LABELS
    ? (raw.disposal_flag as AuctionType)
    : '1'

  return {
    id: raw.ropa_id,
    batchNo: raw.batch_no,
    location: raw.prop_location,
    cityMuni: raw.city_muni,
    subdivision: raw.subdivision,
    propertyType: raw.prop_type,
    titleNo: raw.tct_cct_no,
    lotArea: parseNumber(raw.lot_area),
    floorArea: parseNumber(raw.floor_area),
    minBid: parseNumber(raw.min_sellprice),
    appraisalDate: parseApiDate(raw.appr_date),
    inspectionDate: parseApiDate(raw.inspection_date),
    auctionType,
    auctionLabel: raw.disposal_type || AUCTION_TYPE_LABELS[auctionType],
    startDate: parseApiDate(raw.start_datetime),
    endDate: parseApiDate(raw.end_datetime),
    openingDate: parseApiDate(raw.opening_datetime),
    occupancy: raw.occupancy || 'Unknown',
    remarks: raw.remarks,
    contact: raw.contact_hbc,
    email: raw.email_hbc,
    handlingUnit: raw.handling_hbc,
    surveyNo: raw.survey_no,
    raw,
  }
}
