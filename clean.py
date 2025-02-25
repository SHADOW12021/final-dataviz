import pandas as pd

#330.10

# Load the Excel file
file_path = "xlsx/tabn330.10.xlsx"  # Change this to your actual file path
xls = pd.ExcelFile(file_path)

# Load the data from the sheet
sheet_name = 'Digest 2023 Table 330.10'
df = pd.read_excel(xls, sheet_name=sheet_name)

# Drop initial metadata rows and reset index
df_cleaned = df.iloc[4:].reset_index(drop=True)

# Keep only columns 1-13
df_cleaned = df_cleaned.iloc[:, :13]

# Rename columns based on the first valid row
df_cleaned.columns = ["Year", "Charge All", "Charge 4-year", "Charge 2-year", "Tuition All", "Tuition 4-year", "Tuition 2-year", "Dorm All", "Dorm 4-year", "Dorm 2-year", "Board All", "Board 4-year", "Board 2-year"]
df_cleaned = df_cleaned[1:].reset_index(drop=True)

# Remove rows with NaN values
df_cleaned = df_cleaned.dropna()

# Save the cleaned data to a new file
df_cleaned.to_csv("1.csv", index=False)

print("Data cleaning complete. Cleaned file saved as '1.csv'.")

#330.20

# Load the Excel file
file_path = "xlsx/tabn330.20.xlsx"  # Change this to your actual file path
xls = pd.ExcelFile(file_path)

# Load the data from the sheet
sheet_name = 'Digest 2023 Table 330.20'
df = pd.read_excel(xls, sheet_name=sheet_name)

# Drop initial metadata rows and reset index
df_cleaned = df.iloc[4:].reset_index(drop=True)

# Rename columns based on the first valid row
df_cleaned.columns = [
    "State", "Public 4-year In-state 21-22 All", "Public 4-year In-state 21-22 Tuition", 
    "Public 4-year In-state 22-23 All", "Public 4-year In-state 22-23 Tuition", 
    "Public 4-year In-state 22-23 Room", "Public 4-year In-state 22-23 Board", 
    "Public 4-year Out-state 22-23 All", "Private 4-year 21-22 All", 
    "Private 4-year 21-22 Tuition", "Private 4-year 22-23 All", 
    "Private 4-year 22-23 Tuition", "Private 4-year 22-23 Room", 
    "Private 4-year 22-23 Board", "Public 2-year In-state 21-22 Tuition", 
    "Public 2-year In-state 22-23 Tuition", "Public 2-year Out-state 22-23 Tuition"
]
df_cleaned = df_cleaned[1:].reset_index(drop=True)

# Remove rows with NaN values
df_cleaned = df_cleaned.dropna()

# Save the cleaned data to a new file
df_cleaned.to_csv("2.csv", index=False)

print("Data cleaning complete. Cleaned file saved as '2.csv'.")

#330.30

# Load the Excel file
file_path = "xlsx/tabn330.30.xlsx"  # Change this to your actual file path
xls = pd.ExcelFile(file_path)

# Load the data from the sheet
sheet_name = 'Digest 2023 Table 330.30'
df = pd.read_excel(xls, sheet_name=sheet_name)

# Drop initial metadata rows and reset index
df_cleaned = df.iloc[4:].reset_index(drop=True)

# Rename columns based on the first valid row
df_cleaned.columns = df_cleaned.iloc[0]
df_cleaned = df_cleaned[1:].reset_index(drop=True)

# Keep only the first 11 columns and remove any references to "2022-23"
df_cleaned = df_cleaned.iloc[:, :11]

# Add a second column for Year and extract the year from the first column
df_cleaned.insert(1, "Year", df_cleaned.iloc[:, 0])

# Assign appropriate labels to the first column (Institution)
institution_labels = {
    (0, 6): "Public institutions",
    (6, 13): "Public 4-year",
    (13, 20): "Public 2-year",
    (20, 27): "Private non-profit",
    (27, 34): "Private Nonprofit 4-year",
    (34, 41): "Private Nonprofit 2-year",
    (41, 48): "Private for-profit",
    (48, 55): "Private for-profit 4-year",
    (55, 62): "Private for-profit 2-year",
}

for (start, end), label in institution_labels.items():
    df_cleaned.iloc[start:end + 1, 0] = label

# Rename the first column to "Institution"
df_cleaned.rename(columns={df_cleaned.columns[0]: "Institution"}, inplace=True)

# Remove rows with NaN values
df_cleaned = df_cleaned.dropna()

# Save the cleaned data to a new file
df_cleaned.to_csv("cleaned_tuition_data_33030.csv", index=False)

print("Data cleaning complete. Cleaned file saved as 'cleaned_tuition_data_33030.csv'.")