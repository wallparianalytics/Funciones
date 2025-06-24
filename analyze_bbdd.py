import argparse
import logging
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd
from tqdm import tqdm


def load_file(filepath: Path) -> List[Tuple[str, pd.DataFrame]]:
    """Load a supported file and return list of (sheet_name, DataFrame).

    Supports Excel (.xlsx), CSV (.csv), and text files (.txt) with
    delimiter detection.
    """
    ext = filepath.suffix.lower()
    if ext == ".xlsx":
        try:
            dfs = pd.read_excel(filepath, sheet_name=None)
            return list(dfs.items())
        except Exception as exc:
            logging.error("Error reading %s: %s", filepath, exc)
            return []
    elif ext in {".csv", ".txt"}:
        delimiter = ","
        if ext == ".txt":
            try:
                with open(filepath, "r", encoding="utf-8") as fh:
                    sample = fh.readline()
                    if ";" in sample and "\t" in sample:
                        delimiter = ";" if sample.count(";") >= sample.count("\t") else "\t"
                    elif ";" in sample:
                        delimiter = ";"
                    elif "\t" in sample:
                        delimiter = "\t"
            except Exception as exc:
                logging.error("Could not detect delimiter for %s: %s", filepath, exc)
        try:
            df = pd.read_csv(filepath, sep=delimiter)
            return [("data", df)]
        except Exception as exc:
            logging.error("Error reading %s: %s", filepath, exc)
            return []
    else:
        logging.warning("Unsupported file format: %s", filepath)
        return []


def infer_types(df: pd.DataFrame) -> pd.DataFrame:
    """Attempt to parse object columns as datetime."""
    for col in df.columns:
        df[col] = pd.to_datetime(df[col], errors="ignore")
    return df


def analyze_numeric(series: pd.Series) -> pd.DataFrame:
    """Return numeric descriptive statistics."""
    stats = series.describe()
    df_stats = stats.to_frame(name="value")
    df_stats = df_stats.rename_axis("metric").reset_index()
    return df_stats


def analyze_categorical(series: pd.Series) -> pd.DataFrame:
    """Return frequency table for categorical or datetime series."""
    freq = series.dropna().astype(str).value_counts().to_frame(name="count")
    if not freq.empty:
        freq["percentage"] = freq["count"] / freq["count"].sum()
    else:
        freq["percentage"] = []
    freq = freq.rename_axis("value").reset_index()
    return freq


def analyze_column(series: pd.Series) -> pd.DataFrame:
    """Analyze a pandas Series based on its dtype."""
    if pd.api.types.is_numeric_dtype(series):
        return analyze_numeric(series)
    else:
        return analyze_categorical(series)


def make_safe_sheet_name(name: str) -> str:
    """Trim sheet names to the Excel 31 character limit."""
    return name[:31]


def main() -> None:
    parser = argparse.ArgumentParser(description="Analiza bases de datos y genera reportes en Excel")
    parser.add_argument("path", help="Carpeta con archivos a analizar")
    parser.add_argument("--threshold", type=float, default=0.10, help="Umbral para marcar columna critica")
    parser.add_argument("--output", default="reporte_bbdd", help="Prefijo para los archivos de salida")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    base_path = Path(args.path)
    if not base_path.is_dir():
        logging.error("La carpeta %s no existe", base_path)
        return

    files = [p for p in base_path.iterdir() if p.suffix.lower() in {".xlsx", ".csv", ".txt"}]
    if not files:
        logging.warning("No se encontraron archivos compatibles en %s", base_path)

    variables_rows: List[Dict[str, str]] = []
    desc_writer = pd.ExcelWriter(f"{args.output}_descriptivas.xlsx", engine="openpyxl")
    miss_writer = pd.ExcelWriter(f"{args.output}_missing.xlsx", engine="openpyxl")

    for file in tqdm(files, desc="Archivos"):
        for sheet_name, df in load_file(file):
            if df.empty:
                logging.warning("%s - %s esta vacio", file.name, sheet_name)
                continue
            df = infer_types(df)
            n_records = len(df)
            for col in df.columns:
                series = df[col]
                dtype = str(series.dtype)
                variables_rows.append(
                    {
                        "archivo": file.name,
                        "hoja": sheet_name,
                        "nombre_columna": col,
                        "tipo_dato": dtype,
                        "n_registros": n_records,
                    }
                )
                missing_pct = series.isna().mean()
                analysis_df = analyze_column(series)
                if missing_pct > args.threshold:
                    # Include missing percent as first row
                    header = pd.DataFrame({analysis_df.columns[0]: ["missing_percent"], analysis_df.columns[1]: [missing_pct]})
                    out_df = pd.concat([header, analysis_df], ignore_index=True)
                    sheet = make_safe_sheet_name(f"{file.stem}_{sheet_name}_{col}")
                    out_df.to_excel(miss_writer, sheet_name=sheet, index=False)
                else:
                    sheet = make_safe_sheet_name(f"{file.stem}_{sheet_name}_{col}")
                    analysis_df.to_excel(desc_writer, sheet_name=sheet, index=False)

    variables_df = pd.DataFrame(variables_rows)
    var_writer = pd.ExcelWriter(f"{args.output}_variables.xlsx", engine="openpyxl")
    variables_df.to_excel(var_writer, index=False)

    var_writer.close()
    desc_writer.close()
    miss_writer.close()


if __name__ == "__main__":
    main()
