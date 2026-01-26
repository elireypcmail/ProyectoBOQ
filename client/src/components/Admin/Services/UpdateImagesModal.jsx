import React, { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { AiFillEye } from "react-icons/ai";
import { MdOutlineCloudUpload } from "react-icons/md";
import "../../../styles/ui/ProjectCard.css";
import "../../../styles/ui/modalViewFile.css";
import { useService } from "../../../context/ServiceContext";

const UpdateImagesModal = ({ service, onClose }) => {
  const { saveFilesService } = useService();
  const [previewFile, setPreviewFile] = useState(null);

  // Archivos iniciales
  const initialFiles =
    service.files?.map((f) => {
      const img = service.images?.find((i) => i.id == f.id);
      return {
        url: img?.data ? `data:${img.mime_type};base64,${img.data}` : null,
        mime_type: img?.mime_type || "",
        name: f.name,
        isLocal: false,
        id: f.id,
        isMain: img?.is_main || false,
      };
    }) || [];

  const [selectedFiles, setSelectedFiles] = useState(initialFiles);

  // ✅ Evitar scroll detrás del modal
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length >= 10) {
      alert("You can only upload a maximum of 10 files");
      return;
    }

    const remainingSlots = 10 - selectedFiles.length;
    const limitedFiles = files.slice(0, remainingSlots);

    const newFiles = limitedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      mime_type: file.type,
      name: file.name,
      file,
      isLocal: true,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex, toIndex) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
  };

  const closePreview = () => setPreviewFile(null);

  const handleSave = async () => {
    const localFiles = selectedFiles
      .filter((f) => f.isLocal)
      .map((f) => f.file);

    const filesJson = selectedFiles.map((f, index) => ({
      id: f.id || null,
      name: f.name,
      order: index + 1,
    }));

    await saveFilesService(service.id, localFiles, filesJson);
    onClose();
  };

  return (
    <div className="modalAdm-backdrop">
      <div className="modalAdm-content">
        <h2 className="modalAdm-title">
          Update service Images/Videos
        </h2>

        <div
          className="uploadAdmEdit-box"
          onClick={() => document.getElementById("fileUpload").click()}
        >
          <MdOutlineCloudUpload size={60} className="uploadAdmEdit-icon" />
          <div className="uploadAdmEdit-text">Select images or videos</div>
          <p className="uploadAdmEdit-subtext">
            You can upload multiple files (max. 10)
          </p>
          <input
            id="fileUpload"
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden-file-input"
            onChange={handleFileChange}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div>
            <h3 className="sectionUpload-title">Selected Files:</h3>
            <ul className="files_containerEdit">
              {selectedFiles.map((file, index) => {
                const isVideo =
                  file.mime_type?.startsWith("video") ||
                  /\.(mp4|webm|ogg)$/i.test(file.name);

                return (
                  <li key={index} className="file_itemEdit">
                    <div className="file_order">{index + 1}</div>

                    <div className="file_background">
                      {isVideo ? (
                        <video
                          src={file.url}
                          className="preview-file"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt={`Archivo ${index + 1}`}
                          className="preview-file"
                        />
                      )}
                    </div>

                    <span className="file_name">{file.name}</span>
                    {index === 0 && (
                      <div className="badge_portada">Front page</div>
                    )}

                    <IoIosCloseCircle
                      color="red"
                      size={28}
                      className="icon_closeimage"
                      onClick={() => removeFile(index)}
                    />

                    <div className="order_buttons">
                      {index > 0 && (
                        <button onClick={() => moveFile(index, index - 1)}>
                          ⬅️
                        </button>
                      )}
                      <button onClick={() => handlePreview(file)}>
                        <AiFillEye size={20} className="icon_image" />
                      </button>
                      {index < selectedFiles.length - 1 && (
                        <button onClick={() => moveFile(index, index + 1)}>
                          ➡️
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="modalAdm-actions">
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-black" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Modal de previsualización */}
      {previewFile && (
        <div className="modalFile" onClick={closePreview}>
          <div className="file-modal-content">
            <button className="close-modal-btn" onClick={closePreview}>
              X
            </button>

            {previewFile.mime_type.startsWith("video") ||
            /\.(mp4|webm|ogg)$/i.test(previewFile.name) ? (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="preview-full"
              />
            ) : (
              <img
                src={previewFile.url}
                className="preview-full"
                alt={previewFile.name}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateImagesModal;
