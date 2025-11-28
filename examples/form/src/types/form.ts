export type FieldType =
  | 'CHECK_BOX'
  | 'LABEL'
  | 'TOGGLE_NUMBER'
  | 'DATE_PICKER';

export interface FieldRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FormField {
  name: string;
  description?: string;
  isReadOnly: boolean;
  rect: FieldRect;
  type: FieldType;
  displayValue?: string;
}

export interface FormPage {
  width: number;
  height: number;
  view: FieldRect;
}

export interface FormMetadata {
  fields: FormField[];
}

export interface FormDefinition {
  formName: string;
  meta: FormMetadata;
  formPages: FormPage[];
}

export interface FormData {
  // Checkboxes
  checkbox_gebuhrfrei?: boolean;
  checkbox_gebpfl?: boolean;
  checkbox_noctu?: boolean;
  checkbox_sonstige?: boolean;
  checkbox_unfall?: boolean;
  checkbox_arbeitsunfall?: boolean;
  checkbox_begr?: boolean;
  checkbox_autIdem1?: boolean;
  checkbox_autIdem2?: boolean;
  checkbox_autIdem3?: boolean;

  // Toggles
  toggle_6_bvg?: boolean;
  toggle_7_hilfsmittel?: boolean;
  toggle_8_impfstoff?: boolean;
  toggle_9_bedarf?: boolean;

  // Labels and text fields
  label_insurance_name?: string;
  label_ik_number?: string;
  label_insurance_number?: string;
  label_insurance_status?: string;
  label_insurance_end_date?: string;

  label_patientInfo?: string;
  label_patientInfo_line1?: string;
  label_patientInfo_line2?: string;
  label_patientInfo_line3?: string;
  label_patientInfo_line4?: string;
  label_patient_fullname?: string;
  label_date_of_birth?: string;
  dob?: string;

  label_bsnr?: string;
  label_lanr?: string;
  label_wop?: string;

  label_unfalltag?: string;
  label_unfallbetriebNummer?: string;

  date_prescribe?: string;
  label_doctor_stamp?: string;
  label_fax_number?: string;
  label_tel_number?: string;

  label_medication?: string;
  label_medication1?: string;
  label_medication2?: string;
  label_medication3?: string;
  label_medication4?: string;
  label_medication5?: string;

  [key: string]: string | boolean | undefined;
}

export interface PrintOptions {
  printerName?: string;
  copies?: number;
  orientation?: 'portrait' | 'landscape';
}
