#!/bin/bash
# LA2TA seed product images generator (runs in background)
set -u
OUT=/home/z/my-project/public/uploads/seed
mkdir -p "$OUT"
cd "$OUT"

gen() {
  local file="$1"; shift
  local prompt="$*"
  if [ -s "$file" ]; then echo "SKIP $file (exists)"; return 0; fi
  for i in 1 2 3; do
    if z-ai image -p "$prompt" -o "./$file" -s 1024x1024 >> /tmp/gen-images-detail.log 2>&1; then
      if [ -s "$file" ]; then echo "OK $file"; return 0; fi
    fi
    echo "RETRY($i) $file"; sleep 3
  done
  echo "FAIL $file"
  return 1
}

gen socks.png "Professional e-commerce product photography of three pairs of colorful folded cotton socks arranged in a neat row, soft studio lighting, clean light beige background, high quality, detailed"
gen women-set.png "Professional e-commerce product photography of an elegant modest women's two-piece knit lounge set in warm beige, neatly folded on clean light background, studio lighting, high quality"
gen mens-tshirt.png "Professional e-commerce product photography of a plain navy blue men's cotton t-shirt on a wooden hanger, clean white studio background, soft lighting, high quality"
gen winter-coat.png "Professional e-commerce product photography of a women's warm winter coat in camel beige color on a mannequin, clean studio background, soft lighting, high quality"
gen jeans.png "Professional e-commerce product photography of men's classic blue denim jeans neatly folded, clean white studio background, soft lighting, high quality"
gen summer-dress.png "Professional e-commerce product photography of a modest long floral summer maxi dress with long sleeves on a hanger, clean light background, studio lighting, high quality"
gen abaya.png "Professional e-commerce product photography of an elegant flowing black abaya with subtle gold embroidery on a mannequin, clean beige studio background, high quality"
gen pajamas.png "Professional e-commerce product photography of a cozy soft cotton pajama set in pastel pink folded neatly with a sleep mask, clean white background, studio lighting, high quality"
gen handbag.png "Professional e-commerce product photography of a stylish caramel brown leather women's handbag, clean white studio background, soft shadows, high quality"
gen sweater.png "Professional e-commerce product photography of a cozy chunky knitted winter sweater in cream color, neatly folded, clean light background, studio lighting, high quality"
gen tracksuit.png "Professional e-commerce product photography of a men's dark grey athletic tracksuit set, hoodie jacket and pants, on clean white studio background, high quality"
gen belt.png "Professional e-commerce product photography of a brown genuine leather men's belt coiled elegantly with a silver buckle, clean white background, studio lighting, high quality"
gen koshari.png "Delicious Egyptian koshari dish in a white bowl, rice lentils macaroni chickpeas topped with crispy fried onions and rich tomato sauce, appetizing restaurant food photography, warm lighting, top view, high quality"
gen koshari-meal.png "Egyptian koshari plate served with a fresh glass of hibiscus juice on a rustic restaurant table, appetizing food photography, warm cozy lighting, high quality"
gen headphones.png "Professional e-commerce product photography of modern premium wireless over-ear headphones in matte black, clean white studio background, dramatic soft lighting, high quality"
gen powerbank.png "Professional e-commerce product photography of a sleek slim black power bank with digital display and usb cable, clean white studio background, high quality"
gen cooking-oil.png "Professional product photography of two large plastic bottles of golden sunflower cooking oil standing side by side, bright supermarket style lighting, clean white background, high quality"
gen tissues.png "Professional product photography of six stacked boxes of soft facial tissues in soft pastel colors, clean bright background, supermarket shelf style, high quality"
gen logo.png "Flat modern minimal logo icon, orange price tag with a small flame, rounded shapes, solid warm orange on white background, vector style, no text"

echo "ALL_DONE"
