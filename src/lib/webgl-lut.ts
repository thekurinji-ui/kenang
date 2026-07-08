// Kenang Kurinji Blueprint v2.0 — Volume 5: Kenang Camera > LUT Engine
//
// Menerapkan color grading nyata dari file .cube (LUT 3D) menggunakan WebGL,
// menggantikan pendekatan lama yang hanya memakai CSS `filter` standar
// (contrast/saturate/dll). LUT diekspor sebagai PNG "strip" 2D
// (lihat scripts/convert-luts) supaya bisa langsung dipakai sebagai texture.
//
// Layout strip: untuk LUT berukuran N, gambar berukuran (N*N) x N. Kanal
// biru memilih salah satu dari N "tile" berdampingan secara horizontal;
// di dalam satu tile, sumbu x = R dan sumbu y = G.

export interface LutRenderer {
  /** Menggambar satu frame video ke canvas dengan LUT aktif diterapkan. */
  draw(video: HTMLVideoElement, mirror: boolean): void;
  /** Mengganti LUT yang sedang aktif (dipanggil saat user ganti film). */
  setLut(image: TexImageSource, lutSize?: number): void;
  /** Melepas semua resource WebGL. Panggil saat komponen unmount. */
  destroy(): void;
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  uniform float u_flipX;
  varying vec2 v_uv;

  void main() {
    vec2 uv = a_position * 0.5 + 0.5;
    if (u_flipX > 0.5) {
      uv.x = 1.0 - uv.x;
    }
    v_uv = uv;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  // PENTING: "mediump" (default sebagian GPU mobile, terutama Adreno/Mali)
  // hanya akurat untuk ~1024 nilai berbeda. LUT premium berukuran 64 butuh
  // membedakan 64*64 = 4096 posisi texel horizontal — dengan mediump,
  // perhitungan u0/u1 di bawah bisa "nyasar" ke tile LUT yang salah,
  // terutama di area highlight/overexposed, menghasilkan pita warna yang
  // salah total (lihat laporan bug: warna terbelah aneh di preview kamera).
  // "highp" wajib dipakai supaya lookup texel presisi di semua ukuran LUT.
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  uniform sampler2D u_video;
  uniform sampler2D u_lut;
  uniform float u_lutSize;
  varying vec2 v_uv;

  vec3 applyLut(vec3 color) {
    float size = u_lutSize;
    float maxIndex = size - 1.0;

    float bIndex = color.b * maxIndex;
    float b0 = floor(bIndex);
    float b1 = min(b0 + 1.0, maxIndex);
    float bFrac = bIndex - b0;

    float rOffset = color.r * maxIndex + 0.5;
    float gOffset = color.g * maxIndex + 0.5;

    float u0 = (b0 * size + rOffset) / (size * size);
    float u1 = (b1 * size + rOffset) / (size * size);
    float v = gOffset / size;

    vec3 sample0 = texture2D(u_lut, vec2(u0, v)).rgb;
    vec3 sample1 = texture2D(u_lut, vec2(u1, v)).rgb;
    return mix(sample0, sample1, bFrac);
  }

  void main() {
    vec3 color = texture2D(u_video, v_uv).rgb;
    gl_FragColor = vec4(applyLut(color), 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Gagal membuat WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Gagal compile shader: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  const program = gl.createProgram();
  if (!program) throw new Error("Gagal membuat WebGL program.");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Gagal link WebGL program: ${log}`);
  }
  return program;
}

function createEmptyTexture(gl: WebGLRenderingContext): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Gagal membuat WebGL texture.");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}

export function createLutRenderer(canvas: HTMLCanvasElement): LutRenderer {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: false,
    preserveDrawingBuffer: true, // supaya canvas.toBlob/drawImage bisa baca frame terakhir
  }) as WebGLRenderingContext | null;

  if (!gl) {
    throw new Error("WebGL tidak didukung di perangkat ini.");
  }

  const program = createProgram(gl);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const positionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const videoTexture = createEmptyTexture(gl);
  let lutTexture: WebGLTexture | null = null;
  let lutSize = 32;

  const videoTexLoc = gl.getUniformLocation(program, "u_video");
  const lutTexLoc = gl.getUniformLocation(program, "u_lut");
  const lutSizeLoc = gl.getUniformLocation(program, "u_lutSize");
  const flipLoc = gl.getUniformLocation(program, "u_flipX");

  return {
    draw(video, mirror) {
      if (!lutTexture) return; // LUT belum selesai dimuat
      if (video.readyState < 2 || video.videoWidth === 0) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.uniform1i(videoTexLoc, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.uniform1i(lutTexLoc, 1);

      gl.uniform1f(lutSizeLoc, lutSize);
      gl.uniform1f(flipLoc, mirror ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    setLut(image, size = 32) {
      lutSize = size;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (!lutTexture) lutTexture = createEmptyTexture(gl);
      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    },

    destroy() {
      gl.deleteTexture(videoTexture);
      if (lutTexture) gl.deleteTexture(lutTexture);
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
    },
  };
}

/** Memuat file PNG strip LUT sebagai HTMLImageElement, siap dipakai `setLut`. */
export function loadLutImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal memuat LUT: ${url}`));
    img.src = url;
  });
    }
