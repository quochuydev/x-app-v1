# Prescribe - KREZ

## Request Body

```json
{
  "doctorId": "e6391e72-3763-47cd-bf2c-2206e97e2146",
  "patientId": "c15cac42-4eb7-4ac4-b228-76b9d50bf772",
  "treatmentDoctorId": "e6391e72-3763-47cd-bf2c-2206e97e2146",
  "assignedToBsnrId": "782d5aff-e0d9-41f6-8751-dbdb38671f4d",
  "encounterCase": "AB",
  "medicineAutIdemIds": [],
  "scheinId": "4cf46402-1418-4806-a746-351640c02835",
  "hasSupportForm907": false,
  "preventGetPatientProfile": true,
  "formInfos": [
    {
      "medicineIDs": [
        "aec9011b-d5ab-40a5-a9e8-9334646c97e9",
        "09145214-71c6-48ab-8c04-4d1b1350e70d",
        "8ae14323-dfac-4674-99e3-31191d394920"
      ],
      "currentFormType": "KREZ",
      "hasChangedSprechsundenbedarf": false,
      "prescribeDate": 1764226131684,
      "printDate": 1764226317999,
      "ePrescription": {
        "isPrintQRCode": false
      },
      "printOption": {
        "dateOfPrint": 1764226317999,
        "pdfWithBackground": false,
        "formAction": "FormAction_PrintFull"
      },
      "formSetting": "<stringified JSON - see below>"
    }
  ]
}
```

## Form Setting (parsed)

The `formSetting` field is a stringified JSON with the following structure:

```json
{
  "checkbox_gebuhrfrei": false,
  "checkbox_gebpfl": true,
  "checkbox_noctu": false,
  "checkbox_sonstige": false,
  "checkbox_unfall": false,
  "checkbox_arbeitsunfall": false,
  "checkbox_begr": false,
  "checkbox_autIdem1": false,
  "checkbox_autIdem2": false,
  "checkbox_autIdem3": false,

  "toggle_6_bvg": false,
  "toggle_7_hilfsmittel": false,
  "toggle_8_impfstoff": false,
  "toggle_9_bedarf": false,

  "label_insurance_name": "Kaufmännische Krankenka.",
  "label_insurance_name_0": "Kaufmännische Krankenka.",
  "label_insurance_name_1": "Kaufmännische Krankenka.",
  "label_insurance_name_2": "Kaufmännische Krankenka.",
  "label_name_der_kran_0": "Kaufmännische Krankenka.",
  "label_ik_number": "106775501",
  "label_insurance_number": "Y765441331",
  "label_insurance_status": "1000000",
  "label_insurance_status_0": "1000000",
  "label_insurance_status_1": "1000000",
  "label_insurance_status_2": "1000000",
  "label_insurance_end_date": "",

  "label_patientInfo": "Clara",
  "label_patientInfo_line1": "Albrecht",
  "label_patientInfo_line2": "Clara",
  "label_patientInfo_line3": " ",
  "label_patientInfo_line4": "D 64283 Darmstadt",
  "label_patient_fullname": "Albrecht, Clara",
  "label_date_of_birth": "08.03.67",
  "dob": "-88992000000",

  "label_bsnr": "462222200",
  "label_bsnr_0": "462222200",
  "label_bsnr_1": "462222200",
  "label_bsnr_2": "462222200",
  "label_lanr": "999955101",
  "label_wop": "",

  "label_unfalltag": "",
  "label_unfallbetriebNummer": "",

  "date_prescribe": "",
  "label_doctor_stamp": "",
  "label_fax_number": "",
  "label_tel_number": "",

  "label_medication": "",
  "label_medication1": "Aspirin® protect 100mg 98 Tbl. msr. N3 | PZN06706155 | >>Dj<<",
  "label_medication1-1": "Aspirin® protect 100mg 98 Tbl. msr. N3 | ",
  "label_medication1-2": "PZN06706155 | >>Dj<<",
  "label_medication2": "FASTJEKT 300 Mikrogramm, 1 Fertigpen N1 | PZN03680917 | >>Dj<<",
  "label_medication2-1": "FASTJEKT 300 Mikrogramm, 1 Fertigpen N1 | ",
  "label_medication2-2": "PZN03680917 | >>Dj<<",
  "label_medication3": "Paroxetin-neuraxpharm 20 mg 100 Tbl. N3 | PZN07390843 | >>Dj<<",
  "label_medication3-1": "Paroxetin-neuraxpharm 20 mg 100 Tbl. N3 | ",
  "label_medication3-2": "PZN07390843 | >>Dj<<",
  "label_medication4": "",
  "label_medication5": ""
}
```
