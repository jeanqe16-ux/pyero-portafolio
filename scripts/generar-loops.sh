#!/usr/bin/env bash
# Genera los loops cuadrados (720x720, sin audio) de las tarjetas de Servicios.
# Uso: bash scripts/generar-loops.sh  (requiere ffmpeg y las carpetas videos-originales/ y material-original/)
set -euo pipefail
cd "$(dirname "$0")/.."

V="videos-originales"
M="material-original/videos_motion"
D="public/media/servicios"
mkdir -p "$D"

# Recorte cuadrado algo por encima del centro, donde suelen estar las caras y los textos
CUADRO="crop=iw:iw:0:(ih-iw)*0.42,scale=720:720:flags=lanczos,fps=30,setsar=1,format=yuv420p"
X="-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -an -movflags +faststart"

# Edición de video: remix de los 5 videos de clientes, un fragmento de 2 s de cada uno, dos vueltas
FUENTES=("CERO MOTION.mp4" "CERO REGRESO A CLASES.mp4" "CERO UBICACION.mp4" "CLINICA DENTAL MOTION.mp4" "CLINICA DENTAL MOTION 2.mp4")
INICIOS=(4.0 2.6 2.4 5.0 2.8 14.5 7.4 17.5 17.5 8.5)
entradas=()
filtro=""
for i in "${!INICIOS[@]}"; do
  entradas+=(-ss "${INICIOS[$i]}" -t 2 -i "$V/${FUENTES[$((i % 5))]}")
  filtro+="[$i:v]$CUADRO,trim=duration=2,setpts=PTS-STARTPTS[v$i];"
done
for i in "${!INICIOS[@]}"; do filtro+="[v$i]"; done
filtro+="concat=n=${#INICIOS[@]}:v=1:a=0[salida]"
ffmpeg -v error -y "${entradas[@]}" -filter_complex "$filtro" -map "[salida]" $X -crf 25 "$D/edicion-de-video.mp4"

# Motion graphics: los dos videos de motion más recientes, uno tras otro
ffmpeg -v error -y -i "$M/AGENTE DE IA ANIMATION.mp4" -i "$M/VIDEO 2.mp4" \
  -filter_complex "[0:v]$CUADRO[a];[1:v]$CUADRO[b];[a][b]concat=n=2:v=1:a=0[salida]" \
  -map "[salida]" $X -crf 27 "$D/motion-graphics.mp4"

# Portadas que se ven antes de que cargue cada video
ffmpeg -v error -y -ss 0.5 -i "$D/edicion-de-video.mp4" -frames:v 1 -c:v libwebp -quality 80 "$D/edicion-de-video.webp"
ffmpeg -v error -y -ss 21 -i "$D/motion-graphics.mp4" -frames:v 1 -c:v libwebp -quality 80 "$D/motion-graphics.webp"

ls -l "$D"
