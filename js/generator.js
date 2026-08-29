const ImageGenerator = (() => {
  const RATIO_MAP = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '4:3': { width: 1024, height: 768 }
  };
  function enhancePrompt(originalPrompt) {
    if (!originalPrompt.trim()) return '';
    const enhancements = ['cinematic lighting', 'highly detailed texturing', '8k resolution', 'photorealistic', 'masterpiece composition', 'natural depth of field'];
    return ${originalPrompt.trim()}, ;
  }
  async function generateImage(prompt, config, overrideSeed = null) {
    const dimensions = RATIO_MAP[config.ratio] || RATIO_MAP['1:1'];
    let w = dimensions.width;
    let h = dimensions.height;
    if (config.quality === 'standard') {
      w = Math.round(w * 0.75);
      h = Math.round(h * 0.75);
    }
    const seed = overrideSeed !== null ? overrideSeed : Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const url = https://pollinations.ai/p/ + encodedPrompt + ?width= + w + &height= + h + &seed= + seed + &model=flux&nologo=true;
    const response = await fetch(url);
    if (!response.ok) { throw new Error("Erro na comunicação com o servidor de IA."); }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    return {
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      url: objectUrl,
      blob: blob,
      prompt: prompt,
      seed: seed,
      timestamp: Date.now()
    };
  }
  return { enhancePrompt, generateImage };
})();
