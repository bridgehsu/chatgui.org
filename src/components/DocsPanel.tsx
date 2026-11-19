type Props = {
  open: boolean;
  onClose: () => void;
};

export function DocsPanel({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="docs-overlay" role="dialog" aria-modal="true" aria-label="文档">
      <button type="button" className="docs-backdrop" aria-label="关闭文档" onClick={onClose} />
      <aside className="docs-panel">
        <div className="docs-panel-head">
          <h2>文档</h2>
          <button type="button" className="icon-btn" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="docs-panel-body">
          <section>
            <h3>这是什么</h3>
            <p>
              ChatGUI 是极简聊天壳，三档引擎：浏览器本地（免安装）→ 本机模型（Ollama / LM
              Studio）→ 自定义 OpenAI 兼容 API。
            </p>
          </section>
          <section>
            <h3>1. 浏览器本地</h3>
            <ol>
              <li>使用较新的 Chrome</li>
              <li>顶部引擎选「浏览器本地」</li>
              <li>若显示需下载/不可用，改用本机模型</li>
            </ol>
          </section>
          <section>
            <h3>2. 本机模型（推荐主力）</h3>
            <ol>
              <li>安装并启动 Ollama</li>
              <li>
                拉取模型，例如 <code>ollama pull llama3.2</code>
              </li>
              <li>
                引擎选「本机模型」，地址一般为 <code>http://localhost:11434/v1</code>
              </li>
              <li>
                在线站点需设置 <code>OLLAMA_ORIGINS=*</code>
              </li>
            </ol>
          </section>
          <section>
            <h3>3. 自定义 API</h3>
            <ul>
              <li>
                <strong>OpenRouter</strong>：填 Key，地址{" "}
                <code>https://openrouter.ai/api/v1</code>
              </li>
              <li>
                <strong>自定义</strong>：任意 OpenAI Chat Completions 兼容端点
              </li>
              <li>
                <strong>LM Studio</strong>：也可放在本机模型里，地址通常{" "}
                <code>http://localhost:1234/v1</code>
              </li>
            </ul>
          </section>
          <section>
            <h3>隐私</h3>
            <p>对话与设置保存在本机浏览器；请求直连你选择的引擎，不经过 ChatGUI 服务器。</p>
          </section>
        </div>
      </aside>
    </div>
  );
}
