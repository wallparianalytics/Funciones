# Funciones

Este repositorio incluye el script `analyze_bbdd.py` para analizar archivos de bases de datos en formatos Excel, CSV o TXT y generar reportes en Excel.

## Instalación

Crea un entorno virtual e instala las dependencias:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Uso

```
python analyze_bbdd.py <carpeta> [--threshold 0.10] [--output reporte_bbdd]
```

- `<carpeta>`: directorio que contiene los archivos `.xlsx`, `.csv` o `.txt`.
- `--threshold`: porcentaje de valores nulos para considerar una columna crítica (por defecto 0.10).
- `--output`: prefijo para los archivos de salida (por defecto `reporte_bbdd`).

Al finalizar se generan tres archivos en la carpeta actual:

1. `<prefijo>_variables.xlsx`: metadatos de cada columna.
2. `<prefijo>_missing.xlsx`: estadísticas de columnas críticas.
3. `<prefijo>_descriptivas.xlsx`: estadísticas de columnas no críticas.

## Ejemplo

```
python analyze_bbdd.py datos/ --threshold 0.2 --output informe
```

Generará `informe_variables.xlsx`, `informe_missing.xlsx` e `informe_descriptivas.xlsx`.
