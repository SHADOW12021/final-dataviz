import pandas as pd

# #330.10

# # Load the Excel file
# file_path = "xlsx/tabn330.10.xlsx"  # Change this to your actual file path
# xls = pd.ExcelFile(file_path)

# # Load the data from the sheet
# sheet_name = 'Digest 2023 Table 330.10'
# df = pd.read_excel(xls, sheet_name=sheet_name)

# # Drop initial metadata rows and reset index
# df_cleaned = df.iloc[4:].reset_index(drop=True)

# # Keep only columns 1-13
# df_cleaned = df_cleaned.iloc[:, :13]

# # Rename columns based on the first valid row
# df_cleaned.columns = ["Year", "Charge All", "Charge 4-year", "Charge 2-year", "Tuition All", "Tuition 4-year", "Tuition 2-year", "Dorm All", "Dorm 4-year", "Dorm 2-year", "Board All", "Board 4-year", "Board 2-year"]
# df_cleaned = df_cleaned[1:].reset_index(drop=True)

# # Remove rows with NaN values
# df_cleaned = df_cleaned.dropna()

# # Save the cleaned data to a new file
# df_cleaned.to_csv("General.csv", index=False)

# print("Data cleaning complete. Cleaned file saved as 'General.csv'.")

# #330.20

# # Load the Excel file
# file_path = "xlsx/tabn330.20.xlsx"  # Change this to your actual file path
# xls = pd.ExcelFile(file_path)

# # Load the data from the sheet
# sheet_name = 'Digest 2023 Table 330.20'
# df = pd.read_excel(xls, sheet_name=sheet_name)

# # Drop initial metadata rows and reset index
# df_cleaned = df.iloc[4:].reset_index(drop=True)

# # Rename columns based on the first valid row
# df_cleaned.columns = [
#     "State", "P4I12 All", "P4I12 Tuition", 
#     "P4I23 All", "P4I23 Tuition", 
#     "P4I23 Room", "P4I23 Board", 
#     "P4O23 All", "Pr412 All", 
#     "Pr412 Tuition", "Pr423 All", 
#     "Pr423 Tuition", "Pr423 Room", 
#     "Pr423 Board", "P2I12 Tuition", 
#     "P2I23 Tuition", "P2O23 Tuition"
# ]
# df_cleaned = df_cleaned[1:].reset_index(drop=True)

# # Remove rows with NaN values
# df_cleaned = df_cleaned.dropna()

# # Save the cleaned data to a new file
# df_cleaned.to_csv("State.csv", index=False)

# print("Data cleaning complete. Cleaned file saved as 'State.csv'.")

# #330.30

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

# # Keep only the first 11 columns
# df_cleaned = df_cleaned.iloc[:, :11]

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

# Rename other columns
column_names = ["Institution", "Year", "All 10th", "All 25th", "All 50th", "All 75th", "All 90th", "Tuition 10th", "Tuition 25th", "Tuition 50th", "Tuition 75th", "Tuition 90th", "Tuition 23 10th", "Tuition 23 25th", "Tuition 23 50th", "Tuition 23 75th", "Tuition 23 90th"]
df_cleaned.columns = column_names

# Remove rows with NaN values
df_cleaned = df_cleaned.dropna()

# Save the cleaned data to a new file
df_cleaned.to_csv("Instuition.csv", index=False)

print("Data cleaning complete. Cleaned file saved as 'Instuition.csv'.")

#330.40

# Load the Excel file
file_path = "xlsx/tabn330.40.xlsx"  # Change this to your actual file path
xls = pd.ExcelFile(file_path)

# Load the data from the sheet
sheet_name = 'Digest 2023 Table 330.40'
df = pd.read_excel(xls, sheet_name=sheet_name)

# Drop initial metadata rows and reset index
df_cleaned = df.iloc[4:].reset_index(drop=True)

# Rename columns based on the first valid row
df_cleaned.columns = df_cleaned.iloc[0]
df_cleaned = df_cleaned[1:].reset_index(drop=True)

# Drop any columns that explicitly mention "2022-23"
df_cleaned = df_cleaned.loc[:, ~df_cleaned.columns.str.contains("2022-23", case=False, na=False)]

# Drop any fully empty rows
df_cleaned = df_cleaned.dropna(how='all')

# Save the cleaned data to a new file
df_cleaned.to_csv("cleaned_tuition_data_33040.csv", index=False)

print("Data cleaning complete. Cleaned file saved as 'cleaned_tuition_data_33040.csv'.")
