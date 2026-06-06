import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FastField, getIn } from "formik";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import clsx from "clsx";
import RequiredLabel from "./RequiredLabel";

/**
 * High-performance Editor component based on ReactQuill.
 * Features: Silent Render (FastField), Image Handling, MUI v5 Standards.
 */
function Editor(props) {
  const { name, label, oldStyle, meta, ...other } = props;

  const shouldUpdate = useCallback((nextProps, currentProps) => {
    return (
      nextProps.name !== currentProps.name ||
      nextProps.label !== currentProps.label ||
      nextProps.required !== currentProps.required ||
      nextProps.disabled !== currentProps.disabled ||
      nextProps.readOnly !== currentProps.readOnly ||
      nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
      getIn(nextProps.formik.values, currentProps.name) !== getIn(currentProps.formik.values, currentProps.name) ||
      getIn(nextProps.formik.errors, currentProps.name) !== getIn(currentProps.formik.errors, currentProps.name) ||
      getIn(nextProps.formik.touched, currentProps.name) !== getIn(currentProps.formik.touched, currentProps.name)
    );
  }, []);

  return (
    <FastField name={name} shouldUpdate={shouldUpdate}>
      {({ field, form, meta: fieldMeta }) => {
        const effectiveMeta = meta || fieldMeta;
        const isError = Boolean(effectiveMeta?.touched && effectiveMeta?.error);

        return (
          <Box sx={{ width: props.fullWidth ? "100%" : "auto" }}>
            {label && (
              <label
                htmlFor={name}
                className={clsx(oldStyle ? "old-label" : "label-container", props.readOnly && "read-only")}
              >
                <RequiredLabel label={label} requiredLabel={props.required || props.validate} />
              </label>
            )}

            <MyEditor
              {...other}
              name={name}
              field={field}
              setFieldValue={form.setFieldValue}
            />

            {isError && (
              <FormHelperText error sx={{ mt: 0.5, ml: 1 }}>
                {effectiveMeta.error}
              </FormHelperText>
            )}
          </Box>
        );
      }}
    </FastField>
  );
}

function MyEditor({
  field,
  name,
  setFieldValue,
  placeholder,
  readOnly = false,
  disabled = false,
  oldStyle = false,
  imageHandler: customImageHandler,
}) {
  // DEBUG: console.log(`Render [Editor]: ${name}`);

  const quillRef = useRef(null);
  const [internalData, setInternalData] = useState(field.value || "");

  useEffect(() => {
    if (field.value !== internalData) {
      setInternalData(field?.value ?? "");
    }
  }, [field?.value]);

  const handleChange = useCallback((value) => {
    setInternalData(value);
    setFieldValue(name, value);
  }, [name, setFieldValue]);

  const handleInsertImage = useCallback((dataUrl, editor) => {
    const range = editor.getSelection?.(true) || { index: editor.getLength(), length: 0 };
    editor.focus?.();
    editor.insertEmbed(range.index, "image", dataUrl);
    editor.setSelection?.(range.index + 1, 0);
  }, []);

  const processFile = useCallback((file, editor, isPaste = false, source = "toolbar") => {
    if (!file || !/^image\//.test(file.type)) return;

    if (typeof customImageHandler === "function") {
      customImageHandler({ editor, quillRef, setFieldValue, file, isPaste, source });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) handleInsertImage(reader.result, editor);
    };
    reader.readAsDataURL(file);
  }, [customImageHandler, setFieldValue, handleInsertImage]);

  const handleImageClick = useCallback(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      processFile(file, editor, false, "toolbar");
    };
  }, [processFile]);

  // Modules config
  const modules = useMemo(() => {
    if (readOnly || disabled) return { toolbar: false };

    return {
      clipboard: { matchVisual: false },
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["image", "link"],
          [
            {
              color: [
                "#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff",
                "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666",
                "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00",
                "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600",
                "#003700", "#002966", "#3d1466",
              ],
            },
          ],
        ],
        handlers: {
          image: handleImageClick,
        },
      },
    };
  }, [readOnly, disabled, handleImageClick]);

  // Attach Paste & Drop Handlers
  useEffect(() => {
    if (readOnly || disabled) return;

    const editorInstance = quillRef.current?.getEditor();
    const quillElement = editorInstance?.root;
    if (!quillElement) return;

    const handlePaste = (event) => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const items = clipboardData?.items;
      if (!items) return;

      const imageItems = Array.from(items).filter(item => item.type.indexOf("image") !== -1);
      if (imageItems.length === 0) return;

      event.preventDefault();
      imageItems.forEach(item => {
        const file = item.getAsFile();
        processFile(file, editorInstance, true, "paste");
      });
    };

    const handleDrop = (event) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter(file => /^image\//.test(file.type));
      if (imageFiles.length === 0) return;

      event.preventDefault();
      imageFiles.forEach(file => processFile(file, editorInstance, false, "drop"));
    };

    const handleDragOver = (e) => e.preventDefault();

    quillElement.addEventListener("paste", handlePaste);
    quillElement.addEventListener("drop", handleDrop);
    quillElement.addEventListener("dragover", handleDragOver);

    return () => {
      quillElement.removeEventListener("paste", handlePaste);
      quillElement.removeEventListener("drop", handleDrop);
      quillElement.removeEventListener("dragover", handleDragOver);
    };
  }, [readOnly, disabled, processFile]);

  return (
    <Box sx={{ 
      "& .ql-container": { minHeight: "150px" },
      "& .ql-editor": { 
        bgcolor: (readOnly || disabled) ? "rgba(0, 0, 0, 0.05)" : "inherit",
        minHeight: "150px"
      }
    }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={internalData}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        modules={modules}
        className={clsx("bg-white", !oldStyle && "editor-container", (readOnly || disabled) && "read-only")}
      />
    </Box>
  );
}

export default memo(Editor);
