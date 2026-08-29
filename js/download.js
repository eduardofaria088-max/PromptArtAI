const DownloadManager = (() => {
  function download(blobOrUrl, filename) {
    let finalUrl = blobOrUrl;
    let created = false;
    if (blobOrUrl instanceof Blob) {
      finalUrl = URL.createObjectURL(blobOrUrl);
      created = true;
    }
    const a = document.createElement('a');
    a.href = finalUrl;
    a.download = filename || promptart- + getTimestampStr() + .jpg;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (created) {
      setTimeout(() => URL.revokeObjectURL(finalUrl), 1000);
    }
  }
  function getTimestampStr() {
    const now = new Date();
    return now.toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  }
  return { download };
})();
