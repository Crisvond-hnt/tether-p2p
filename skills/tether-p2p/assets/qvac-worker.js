/**
 * Gold Recipe C. Runs in a SECOND Bare worker only.
 * Do not require this file from Node. Do not import @qvac/sdk.
 * Official host: hello-pear-qvac-tui (workers/qvac.js).
 */
export async function bootQvac ({ modelName = 'LLAMA_3_2_1B_INST_Q4_0', ctxSize = 8192, onProgress } = {}) {
  const sdk = await import('@qvac/inference')
  const { llmPlugin } = await import('@qvac/inference/llamacpp-completion/plugin')
  sdk.registerPlugin(llmPlugin)
  const modelSrc = sdk[modelName]
  if (!modelSrc) throw new Error('Unknown model: ' + modelName)
  const modelId = await sdk.loadModel({
    modelSrc,
    modelConfig: { ctx_size: ctxSize },
    onProgress
  })
  return { sdk, modelId }
}

export function complete ({ sdk, modelId, history }) {
  return sdk.completion({ modelId, history, captureThinking: true })
}

export async function shutdownQvac ({ sdk, modelId }) {
  if (modelId) await sdk.unloadModel({ modelId })
}
