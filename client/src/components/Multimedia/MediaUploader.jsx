import React from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import "../../styles/components/MediaUploader.css";

const MediaUploader = ({
  files = [],
  setFiles,
  maxFiles = 5,
  accept = "image/*",
  title = "Subir archivos",
  subtitle = "PNG, JPG, MP4",
}) => {

  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files);

    if (files.length + incoming.length > maxFiles) {
      alert(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    const parsed = incoming.map(file => ({
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name,
      file
    }));

    setFiles(prev => [...prev, ...parsed]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="media-uploader">

      {/* UPLOAD AREA */}
      <div
        className="upload-area"
        onClick={() => document.getElementById("mediaUploadInput").click()}
      >
        <MdOutlineCloudUpload size={48} />
        <p className="upload-title">{title}</p>
        <p className="upload-subtitle">{subtitle}</p>
        <input
          id="mediaUploadInput"
          type="file"
          hidden
          multiple
          accept={accept}
          onChange={handleFileChange}
        />
      </div>

      {/* PREVIEW */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, idx) => (
            <div key={idx} className="file-card">
              {file.mime_type.startsWith("video")
                ? <video src={file.url} />
                : <img src={file.url} alt="preview" />
              }
              <button className="file-remove" onClick={() => removeFile(idx)}>
                <IoClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MediaUploader;
