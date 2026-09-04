import React, { useState, useRef, useEffect } from 'react';
import { 
    Upload, 
    Download, 
    Trash2, 
    FileText, 
    Scissors,
    FileCog,
    Eye,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Type,
    Image as ImageIcon
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import toast from 'react-hot-toast';

const PDFTools = () => {
    const [pdfData, setPdfData] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [compressionLevel, setCompressionLevel] = useState('medium');
    const [pdfPages, setPdfPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pdfUrl, setPdfUrl] = useState(null);
    const fileInputRef = useRef(null);
    const iframeRef = useRef(null);

    // Clean up URL on unmount
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // Update PDF URL when data changes
    useEffect(() => {
        if (pdfData && pdfData.buffer) {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
            // Create blob URL
            const blob = new Blob([pdfData.buffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        }
    }, [pdfData]);

    // Upload PDF
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        try {
            setLoading(true);
            const arrayBuffer = await file.arrayBuffer();
            
            // Load with pdf-lib to get page count
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPageCount();
            
            setOriginalFile({
                name: file.name,
                size: file.size,
                pages: pages
            });
            
            setPdfData({
                buffer: arrayBuffer,
                name: file.name,
                size: file.size,
                pages: pages
            });

            setTotalPages(pages);
            const pageList = Array.from({ length: pages }, (_, i) => i + 1);
            setPdfPages(pageList);
            setCurrentPage(1);
            
            toast.success(`PDF uploaded: ${pages} pages`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to load PDF');
        } finally {
            setLoading(false);
            fileInputRef.current.value = '';
        }
    };

    // Compress PDF
    const handleCompress = async () => {
        if (!pdfData) {
            toast.error('Please upload a PDF first');
            return;
        }

        try {
            setLoading(true);
            const pdfDoc = await PDFDocument.load(pdfData.buffer);
            
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: 50,
            });
            
            const compressedSize = compressedBytes.length;
            const savedPercent = Math.round((1 - compressedSize / pdfData.size) * 100);
            
            setPdfData({
                ...pdfData,
                buffer: compressedBytes,
                size: compressedSize,
                compressed: true,
                originalSize: pdfData.size,
                savedPercent: savedPercent
            });
            
            toast.success(`Compressed! Saved ${savedPercent}%`);
        } catch (error) {
            console.error('Compression error:', error);
            toast.error('Compression failed');
        } finally {
            setLoading(false);
        }
    };

    // Download PDF
    const handleDownload = () => {
        if (!pdfData) {
            toast.error('No PDF to download');
            return;
        }

        try {
            const blob = new Blob([pdfData.buffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `processed_${originalFile?.name || 'document.pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Download failed');
        }
    };

    // Discard PDF
    const handleDiscard = () => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        setPdfData(null);
        setOriginalFile(null);
        setPdfPages([]);
        setCurrentPage(1);
        setScale(1);
        setTotalPages(0);
        setPdfUrl(null);
        toast.success('PDF discarded');
    };

    // Rotate Page
    const handleRotate = async (angle) => {
        if (!pdfData) return;
        
        try {
            const pdfDoc = await PDFDocument.load(pdfData.buffer);
            const pages = pdfDoc.getPages();
            const pageIndex = currentPage - 1;
            
            if (pageIndex < pages.length) {
                const page = pages[pageIndex];
                const currentRotation = page.getRotation().angle || 0;
                page.setRotation(degrees(currentRotation + angle));
                
                const newBuffer = await pdfDoc.save();
                setPdfData({
                    ...pdfData,
                    buffer: newBuffer
                });
                
                toast.success(`Page ${currentPage} rotated`);
            }
        } catch (error) {
            console.error('Rotation error:', error);
            toast.error('Rotation failed');
        }
    };

    // Extract Pages
    const handleExtractPages = async (pageNumbers) => {
        if (!pdfData) {
            toast.error('Please upload a PDF first');
            return;
        }

        try {
            setLoading(true);
            const pdfDoc = await PDFDocument.load(pdfData.buffer);
            const newPdf = await PDFDocument.create();
            
            const pageIndices = pageNumbers.map(p => p - 1);
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const extractedBytes = await newPdf.save();
            
            setPdfData({
                ...pdfData,
                buffer: extractedBytes,
                size: extractedBytes.length,
                pages: pageNumbers.length,
                extracted: true
            });
            
            setTotalPages(pageNumbers.length);
            setPdfPages(Array.from({ length: pageNumbers.length }, (_, i) => i + 1));
            setCurrentPage(1);
            
            toast.success(`Extracted ${pageNumbers.length} pages`);
        } catch (error) {
            console.error('Extraction error:', error);
            toast.error('Extraction failed');
        } finally {
            setLoading(false);
        }
    };

    // Add Text to PDF
    const handleAddText = async () => {
        if (!pdfData) {
            toast.error('Please upload a PDF first');
            return;
        }

        const text = window.prompt('Enter text to add:');
        if (!text) return;

        try {
            const pdfDoc = await PDFDocument.load(pdfData.buffer);
            const pages = pdfDoc.getPages();
            const pageIndex = currentPage - 1;
            
            if (pageIndex < pages.length) {
                const page = pages[pageIndex];
                const { width, height } = page.getSize();
                
                page.drawText(text, {
                    x: 50,
                    y: height - 50,
                    size: 12,
                    color: { r: 0, g: 0, b: 0 },
                });
                
                const newBuffer = await pdfDoc.save();
                setPdfData({
                    ...pdfData,
                    buffer: newBuffer
                });
                toast.success('Text added successfully');
            }
        } catch (error) {
            console.error('Add text error:', error);
            toast.error('Failed to add text');
        }
    };

    // Add Image to PDF
    const handleAddImage = async () => {
        if (!pdfData) {
            toast.error('Please upload a PDF first');
            return;
        }
        toast.error('Image upload coming soon!');
    };

    // Delete Page
    const handleDeletePage = async () => {
        if (!pdfData || pdfData.pages <= 1) {
            toast.error('Cannot delete the only page');
            return;
        }

        try {
            const pdfDoc = await PDFDocument.load(pdfData.buffer);
            const pageIndex = currentPage - 1;
            
            pdfDoc.removePage(pageIndex);
            
            const newBuffer = await pdfDoc.save();
            const newPageCount = pdfDoc.getPageCount();
            
            setPdfData({
                ...pdfData,
                buffer: newBuffer,
                pages: newPageCount
            });
            
            setTotalPages(newPageCount);
            setPdfPages(Array.from({ length: newPageCount }, (_, i) => i + 1));
            if (currentPage > newPageCount) {
                setCurrentPage(newPageCount);
            }
            
            toast.success(`Page ${currentPage} deleted`);
        } catch (error) {
            console.error('Delete page error:', error);
            toast.error('Failed to delete page');
        }
    };

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    // Navigation controls
    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            // Navigate iframe to specific page
            if (iframeRef.current && pdfUrl) {
                iframeRef.current.src = `${pdfUrl}#page=${currentPage - 1}`;
            }
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            if (iframeRef.current && pdfUrl) {
                iframeRef.current.src = `${pdfUrl}#page=${currentPage + 1}`;
            }
        }
    };

    // Update iframe when page changes via input
    useEffect(() => {
        if (iframeRef.current && pdfUrl) {
            iframeRef.current.src = `${pdfUrl}#page=${currentPage}`;
        }
    }, [currentPage, pdfUrl]);

    return (
        <div className="p-6 bg-green-50 dark:bg-black min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                        PDF Tools
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Upload, view, edit, and process PDFs locally. Download to save.
                    </p>
                </div>

                {/* Upload Section */}
                <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-6 mb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleUpload}
                            className="hidden"
                            id="pdfUpload"
                        />
                        <label
                            htmlFor="pdfUpload"
                            className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer font-medium flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload PDF
                        </label>
                        
                        {originalFile && (
                            <div className="flex items-center gap-4 ml-auto flex-wrap">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {originalFile.name}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatSize(originalFile.size)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {originalFile.pages} pages
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {pdfData && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Panel - Tools */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Info Bar */}
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Size: <span className="font-medium text-gray-900 dark:text-white">{formatSize(pdfData.size)}</span>
                                    </p>
                                    {pdfData.originalSize && (
                                        <p className="text-green-600 dark:text-green-400">
                                            Saved: {pdfData.savedPercent}%
                                        </p>
                                    )}
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Pages: <span className="font-medium text-gray-900 dark:text-white">{totalPages || pdfData.pages}</span>
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Page: <span className="font-medium text-gray-900 dark:text-white">{currentPage} / {totalPages || pdfData.pages}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleCompress}
                                        disabled={loading}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 hover:scale-105 font-medium disabled:opacity-50 text-sm flex items-center gap-2"
                                    >
                                        <FileCog className="w-4 h-4" />
                                        {loading ? 'Processing...' : 'Compress PDF'}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 hover:scale-105 font-medium text-sm flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={handleDiscard}
                                        className="w-full px-4 py-2 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-300 font-medium text-sm flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Discard
                                    </button>
                                </div>
                            </div>

                            {/* Page Tools */}
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Page Tools</h3>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={goToPrevPage}
                                            disabled={currentPage <= 1}
                                            className="flex-1 px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button
                                            onClick={goToNextPage}
                                            disabled={currentPage >= totalPages}
                                            className="flex-1 px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4 mx-auto" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRotate(-90)}
                                            className="flex-1 px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                            <RotateCcw className="w-4 h-4 mx-auto" />
                                        </button>
                                        <button
                                            onClick={() => handleRotate(90)}
                                            className="flex-1 px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                            <RotateCw className="w-4 h-4 mx-auto" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleDeletePage}
                                        className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm"
                                    >
                                        Delete Current Page
                                    </button>
                                </div>
                            </div>

                            {/* Edit Tools */}
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Edit Tools</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleAddText}
                                        className="w-full px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <Type className="w-4 h-4" />
                                        Add Text
                                    </button>
                                    <button
                                        onClick={handleAddImage}
                                        className="w-full px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                        Add Image
                                    </button>
                                </div>
                            </div>

                            {/* Page Extraction */}
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Extract Pages</h3>
                                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-green-50 dark:bg-black/50 rounded-lg">
                                    {pdfPages.map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handleExtractPages([page])}
                                            className="px-3 py-1 bg-white dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        const selected = window.prompt('Enter page numbers (comma-separated, e.g., 1,2,3)');
                                        if (selected) {
                                            const pages = selected.split(',').map(p => parseInt(p.trim()));
                                            if (pages.every(p => !isNaN(p) && p > 0 && p <= totalPages)) {
                                                handleExtractPages(pages);
                                            } else {
                                                toast.error(`Invalid page numbers. Must be between 1 and ${totalPages}`);
                                            }
                                        }
                                    }}
                                    className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 hover:scale-105 font-medium text-sm"
                                >
                                    <Scissors className="w-4 h-4 inline mr-1" />
                                    Extract Selected
                                </button>
                            </div>
                        </div>

                        {/* Right Panel - PDF Preview */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        Preview
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>
                                </div>

                                {/* PDF Viewer - Using iframe with Google Chrome's PDF viewer */}
                                <div className="relative bg-white dark:bg-black/50 rounded-lg border border-green-200/30 dark:border-green-800/30 overflow-hidden" style={{ height: '600px' }}>
                                    {pdfUrl ? (
                                        <iframe
                                            ref={iframeRef}
                                            src={`${pdfUrl}#page=${currentPage}&view=FitH`}
                                            className="w-full h-full"
                                            style={{ 
                                                border: 'none',
                                                backgroundColor: '#ffffff',
                                            }}
                                            title="PDF Viewer"
                                            sandbox="allow-scripts allow-same-origin allow-modals"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center py-12">
                                                <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">Upload a PDF to preview</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Page Navigation */}
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={goToPrevPage}
                                        disabled={currentPage <= 1}
                                        className="px-4 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Page
                                        </span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={totalPages}
                                            value={currentPage}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (val >= 1 && val <= totalPages) {
                                                    setCurrentPage(val);
                                                }
                                            }}
                                            className="w-16 px-2 py-1 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-center"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            of {totalPages}
                                        </span>
                                    </div>
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage >= totalPages}
                                        className="px-4 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFTools;