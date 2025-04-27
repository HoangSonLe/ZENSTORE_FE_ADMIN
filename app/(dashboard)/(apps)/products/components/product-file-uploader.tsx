"use client";
import { Fragment, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface FileWithPreview extends File {
    preview: string;
}

interface ProductFileUploaderProps {
    value: FileWithPreview[];
    onChange: (files: FileWithPreview[]) => void;
}

const ProductFileUploader = ({ value, onChange }: ProductFileUploaderProps) => {
    const [files, setFiles] = useState<FileWithPreview[]>(value || []);
    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 5,
        maxSize: 5000000, // 5MB
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif"],
        },
        onDrop: (acceptedFiles) => {
            const newFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );

            const updatedFiles = [...files, ...newFiles].slice(0, 5);
            setFiles(updatedFiles);
            onChange(updatedFiles);
        },
        onDropRejected: () => {
            toast.error("Bạn chỉ có thể upload tối đa 5 ảnh. Mỗi ảnh tối đa 5 MB");
        },
    });

    const renderFilePreview = (file: FileWithPreview) => {
        if (file.type.startsWith("image")) {
            return (
                <Image
                    width={48}
                    height={48}
                    alt={file.name}
                    src={file.preview}
                    className="rounded border p-0.5 object-cover"
                    unoptimized={true}
                />
            );
        } else {
            return <FileText className="w-12 h-12" />;
        }
    };

    const handleRemoveFile = (file: FileWithPreview) => {
        const filtered = files.filter((i) => i.name !== file.name);
        setFiles([...filtered]);
        onChange([...filtered]);
    };

    const fileList = files.map((file) => (
        <div key={file.name} className="flex justify-between border px-3.5 py-3 my-2 rounded-md">
            <div className="flex gap-3 items-center">
                <div className="file-preview">{renderFilePreview(file)}</div>
                <div>
                    <div className="text-sm text-card-foreground">{file.name}</div>
                    <div className="text-xs font-light text-muted-foreground">
                        {file.size > 1024 * 1024 ? (
                            <>{(file.size / (1024 * 1024)).toFixed(1)} MB</>
                        ) : (
                            <>{(file.size / 1024).toFixed(1)} KB</>
                        )}
                    </div>
                </div>
            </div>

            <Button
                size="icon"
                variant="ghost"
                color="destructive"
                className="rounded-full"
                onClick={() => handleRemoveFile(file)}
            >
                <X className="h-5 w-5" />
            </Button>
        </div>
    ));

    const handleRemoveAllFiles = () => {
        setFiles([]);
        onChange([]);
    };

    return (
        <Fragment>
            <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />
                <div className="w-full text-center border-dashed border rounded-md py-6 flex items-center flex-col">
                    <div className="h-12 w-12 inline-flex rounded-md bg-muted items-center justify-center mb-3">
                        <Upload className="h-6 w-6 text-default-500" />
                    </div>
                    <h4 className="text-base font-medium mb-1 text-card-foreground/80">
                        Thả ảnh tại đây hoặc nhấp chuột để upload ảnh
                    </h4>
                    <div className="text-xs text-muted-foreground">
                        (Tối đa 5 images kích thước tối đa 5 MB mỗi ảnh)
                    </div>
                </div>
            </div>
            {files.length > 0 && (
                <Fragment>
                    <div className="mt-4">{fileList}</div>
                    {files.length > 1 && (
                        <div className="flex justify-end gap-2 mt-2">
                            <Button
                                variant="outline"
                                color="destructive"
                                onClick={handleRemoveAllFiles}
                            >
                                Xóa tất cả
                            </Button>
                        </div>
                    )}
                </Fragment>
            )}
        </Fragment>
    );
};

export default ProductFileUploader;
