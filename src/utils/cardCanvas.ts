interface CardOptions {
  title: string;
  type: string;
  cost: number;
  description: string;
  frameColor: string;
  creator: string;
  imageElement?: HTMLImageElement;
  attack?: number;
  defense?: number;
}
interface CardDimensions {
  canvasWidth: number;
  canvasHeight: number;
  border: number;
  cutSize: number;
  imageHeight: number;
  titleBarHeight: number;
  typeBarHeight: number;
  footerHeight: number;
}
const CARD_DIMENSIONS: CardDimensions = {
  canvasWidth: 400,
  canvasHeight: 600,
  border: 12,
  cutSize: 48,
  imageHeight: 300,
  titleBarHeight: 56,
  typeBarHeight: 32,
  footerHeight: 68,
};
const cyrodiilFont = new FontFace("Cyrodiil", "url(/fonts/Cyrodiil.otf)", {
  weight: "normal",
  style: "normal",
  display: "fallback",
});

const FONT_FALLBACK = '"Cyrodiil", "Times New Roman", Georgia, serif';

function getFontString(weight: string, size: number): string {
  return `${weight} ${size}px ${FONT_FALLBACK}`;
}

async function ensureFontLoaded() {
  try {
    if (cyrodiilFont.status !== "loaded") {
      const font = await cyrodiilFont.load();
      document.fonts.add(font);
    }
  } catch {
    // Intenta cargar la fuente, y si falla, pone las fuentes predeterminadas
  }
}
export async function drawCard(
  ctx: CanvasRenderingContext2D,
  options: CardOptions
): Promise<void> {
  await ensureFontLoaded();
  const {
    title,
    type,
    cost,
    description,
    frameColor,
    creator,
    imageElement,
    attack,
    defense,
  } = options;
  const {
    canvasWidth,
    canvasHeight,
    border,
    cutSize,
    imageHeight,
    titleBarHeight,
    typeBarHeight,
    footerHeight,
  } = CARD_DIMENSIONS;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvasWidth - cutSize, 0);
  ctx.lineTo(canvasWidth, cutSize);
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.lineTo(cutSize, canvasHeight);
  ctx.lineTo(0, canvasHeight - cutSize);
  ctx.closePath();
  ctx.fillStyle = frameColor;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(border, border);
  ctx.lineTo(canvasWidth - cutSize, border);
  ctx.lineTo(canvasWidth - border, cutSize);
  ctx.lineTo(canvasWidth - border, canvasHeight - border);
  ctx.lineTo(cutSize, canvasHeight - border);
  ctx.lineTo(border, canvasHeight - cutSize);
  ctx.closePath();
  ctx.fillStyle = "#f0f0f0";
  ctx.fill();
  ctx.restore();
  if (imageElement) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(border, border);
    ctx.lineTo(canvasWidth - cutSize, border);
    ctx.lineTo(canvasWidth - border, cutSize);
    ctx.lineTo(canvasWidth - border, imageHeight + border);
    ctx.lineTo(cutSize, imageHeight + border);
    ctx.lineTo(border, imageHeight + cutSize);
    ctx.closePath();
    ctx.clip();
    const imgX = border;
    const imgY = border;
    const drawWidth = canvasWidth - 2 * border;
    const drawHeight = imageHeight;
    let finalWidth = drawWidth;
    let finalHeight = drawHeight;
    const imageRatio = imageElement.width / imageElement.height;
    const areaRatio = drawWidth / drawHeight;
    if (imageRatio > areaRatio) {
      finalHeight = drawHeight;
      finalWidth = drawHeight * imageRatio;
    } else {
      finalWidth = drawWidth;
      finalHeight = drawWidth / imageRatio;
    }
    const offsetX = (drawWidth - finalWidth) / 2;
    const offsetY = (drawHeight - finalHeight) / 2;
    ctx.drawImage(
      imageElement,
      imgX + offsetX,
      imgY + offsetY,
      finalWidth,
      finalHeight
    );
    ctx.restore();
  }
  ctx.save();
  const costRadius = 28;
  const extraMargin = 2;
  const costX = border + costRadius + extraMargin;
  const costY = border + costRadius + extraMargin;
  ctx.beginPath();
  ctx.arc(costX, costY, costRadius, 0, 2 * Math.PI);
  ctx.fillStyle = "#222";
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = getFontString("bold", 28);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(cost), costX, costY);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#c6c6c6";
  ctx.fillRect(border, imageHeight, canvasWidth - 2 * border, titleBarHeight);
  ctx.fillStyle = "#222";
  ctx.font = getFontString("bold", 24);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, canvasWidth / 2, imageHeight + titleBarHeight / 2);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#dadada";
  ctx.fillRect(
    border,
    imageHeight + titleBarHeight,
    canvasWidth - 2 * border,
    typeBarHeight
  );
  const typeTranslations: Record<string, string> = {
    Creature: "Criatura",
    Artifact: "Artefacto",
    Spell: "Hechizo",
  };
  ctx.fillStyle = "#333";
  ctx.font = getFontString("600", 18);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const translatedType = (typeTranslations[type] || type).toUpperCase();
  ctx.fillText(
    translatedType,
    canvasWidth / 2,
    imageHeight + titleBarHeight + typeBarHeight / 2
  );
  ctx.restore();
  const descY = imageHeight + titleBarHeight + typeBarHeight;
  const defenseHeight = 38;
  const defenseMargin = 8;
  const availableDescHeight = Math.max(
    canvasHeight - border - descY - defenseHeight - defenseMargin,
    0
  );
  const descHeight = availableDescHeight;
  if (descHeight > 0) {
    ctx.save();
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(border, descY, canvasWidth - 2 * border, descHeight);
    ctx.fillStyle = "#333";
    ctx.font = getFontString("normal", 17);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lineHeight = 22;
    const descBoxWidth = canvasWidth - 2 * border - 32;
    const maxLines = Math.floor(descHeight / lineHeight);
    const lines: string[] = [];
    const words = description.split(" ");
    let currentLine = "";
    for (const word of words) {
      if (ctx.measureText(word).width > descBoxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          if (lines.length >= maxLines) break;
          currentLine = "";
        }
        let remainingWord = word;
        while (remainingWord && lines.length < maxLines) {
          let i = remainingWord.length;
          let chunk = remainingWord;
          while (ctx.measureText(chunk).width > descBoxWidth && i > 0) {
            i--;
            chunk = remainingWord.substring(0, i);
          }
          if (i > 0) {
            lines.push(chunk);
            remainingWord = remainingWord.substring(i);
          } else {
            lines.push(remainingWord[0]);
            remainingWord = remainingWord.substring(1);
          }
        }
      } else {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width <= descBoxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            if (lines.length >= maxLines) break;
          }
          currentLine = word;
        }
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
    const fixedPadding = 16;
    const availableHeight = descHeight - fixedPadding * 2;
    const totalLines = Math.min(lines.length, maxLines);
    const totalTextHeight = totalLines * lineHeight;
    const extraSpace = Math.max(availableHeight - totalTextHeight, 0);
    const startY = descY + fixedPadding + extraSpace / 2;
    lines.slice(0, maxLines).forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.fillText(line, canvasWidth / 2, y);
    });
    ctx.restore();
  }
  const footerY = canvasHeight - border - footerHeight;
  ctx.save();
  const footerLabelFont = 12;
  const footerNameFont = 14;
  const footerGap = 4;
  const footerPaddingBottom = 12;
  const footerBaseline = footerY + footerHeight - footerPaddingBottom;
  const footerLabel = "Created by:";
  const footerName = creator && creator !== "undefined" ? creator : "Anónimo";
  const footerLabelFontStr = getFontString("400", footerLabelFont);
  const footerNameFontStr = getFontString("600", footerNameFont);
  ctx.fillStyle = "#222";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = footerLabelFontStr;
  const labelWidth = ctx.measureText(footerLabel).width;
  ctx.font = footerNameFontStr;
  const nameWidth = ctx.measureText(footerName).width;
  const totalWidth = labelWidth + footerGap + nameWidth;
  const footerStartX = (canvasWidth - totalWidth) / 2;
  ctx.font = footerLabelFontStr;
  ctx.fillText(footerLabel, footerStartX, footerBaseline);
  ctx.font = footerNameFontStr;
  ctx.fillText(
    footerName,
    footerStartX + labelWidth + footerGap,
    footerBaseline
  );
  ctx.restore();
  if (type === "Creature" && attack !== undefined && defense !== undefined) {
    const rectW = 80;
    const rectH = 38;
    const rectX = canvasWidth - border - rectW;
    const rectY = canvasHeight - border - rectH;
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.globalAlpha = 0.85;
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.font = getFontString("bold", 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${attack} / ${defense}`,
      rectX + rectW / 2,
      rectY + rectH / 2
    );
    ctx.restore();
  }
}
export const CARD_DIMENSIONS_EXPORT = CARD_DIMENSIONS;
