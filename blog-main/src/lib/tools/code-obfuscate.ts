import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as minifyJs } from 'terser';

export type CodeLanguage = 'javascript' | 'css' | 'html';
export type CodeProcessMode = 'minify' | 'obfuscate';
export type CodeObfuscateLevel = 'normal' | 'strong';

const MAX_CODE_LENGTH = 200_000;

function minifyCss(code: string) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();
}

function minifyHtml(code: string) {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

async function minifyJavaScript(code: string) {
  try {
    const result = await minifyJs(code, {
      compress: {
        dead_code: true,
        drop_console: false,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    });

    if (!result.code) {
      throw new Error('JavaScript 压缩后没有输出。');
    }

    return result.code;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'JavaScript 压缩失败，请检查语法是否正确。',
    );
  }
}

function obfuscateJavaScript(code: string, level: CodeObfuscateLevel) {
  const strong = level === 'strong';
  const result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: strong ? ['base64'] : [],
    stringArrayThreshold: strong ? 0.75 : 0.55,
    rotateStringArray: true,
    splitStrings: strong,
    splitStringsChunkLength: 8,
    controlFlowFlattening: strong,
    controlFlowFlatteningThreshold: strong ? 0.5 : 0,
    deadCodeInjection: strong,
    deadCodeInjectionThreshold: strong ? 0.2 : 0,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: false,
    transformObjectKeys: strong,
    unicodeEscapeSequence: false,
  });

  return result.getObfuscatedCode();
}

function buildStats(before: number, after: number) {
  const ratio = before === 0 ? '0%' : `${Math.round((after / before) * 100)}%`;
  return { before, after, ratio };
}

export async function processCodeObfuscate(input: {
  code: string;
  language: CodeLanguage;
  mode: CodeProcessMode;
  level?: CodeObfuscateLevel;
}) {
  const code = input.code.trim();
  if (!code) {
    throw new Error('请输入要处理的代码。');
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw new Error(`代码过长，请控制在 ${MAX_CODE_LENGTH.toLocaleString()} 字符以内。`);
  }

  const language = input.language;
  const mode = input.mode;
  const level = input.level || 'normal';
  const before = new TextEncoder().encode(code).byteLength;

  let output = code;
  let appliedMode: CodeProcessMode = mode;

  if (language === 'javascript') {
    if (mode === 'obfuscate') {
      output = obfuscateJavaScript(code, level);
      appliedMode = 'obfuscate';
    } else {
      output = await minifyJavaScript(code);
      appliedMode = 'minify';
    }
  } else if (language === 'css') {
    if (mode === 'obfuscate') {
      throw new Error('CSS 暂不支持混淆，请改用「仅压缩」。');
    }
    output = minifyCss(code);
    appliedMode = 'minify';
  } else {
    if (mode === 'obfuscate') {
      throw new Error('HTML 暂不支持混淆，请改用「仅压缩」。');
    }
    output = minifyHtml(code);
    appliedMode = 'minify';
  }

  const after = new TextEncoder().encode(output).byteLength;

  return {
    output,
    language,
    mode: appliedMode,
    level: language === 'javascript' && appliedMode === 'obfuscate' ? level : null,
    stats: buildStats(before, after),
  };
}
