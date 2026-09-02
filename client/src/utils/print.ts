export const printDocuments = (docs: string[]): void => {
  const originalTitle = document.title;
  for (const html of docs) {
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0',
    });
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc) {
      iframe.remove();
      continue;
    }

    doc.open();
    doc.write(html);
    doc.close();

    void doc.body.offsetHeight;
    if (doc.title) document.title = doc.title;
    win.focus();
    win.print();
    document.title = originalTitle;
    iframe.remove();
  }
};
