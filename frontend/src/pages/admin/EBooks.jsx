import React, { useState, useRef, useEffect } from 'react';
import { 
    BookOpen, 
    Plus, 
    Trash2, 
    Type, 
    Image as ImageIcon,
    Download,
    X,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Eye,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    FileText,
    Palette,
    Move,
    Maximize2,
    Minimize2,
    Layout,
    Grid,
    List,
    Save,
    Edit,
    Sparkles,
    Layers,
    ArrowUp,
    ArrowDown,
    Copy,
    PaintBucket,
    Heading1,
    Heading2,
    Heading3
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const EBooks = () => {
    // State for pages
    const [pages, setPages] = useState([
        {
            id: 1,
            elements: [],
            background: '#ffffff',
            pageNumber: 1
        }
    ]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedElement, setSelectedElement] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [showCover, setShowCover] = useState(true);
    const [coverColor, setCoverColor] = useState('#f0fdf4');
    const [coverTextColor, setCoverTextColor] = useState('#166534');
    const [coverTitle, setCoverTitle] = useState('My E-Book');
    const [coverAuthor, setCoverAuthor] = useState('Author Name');
    const [coverSubtitle, setCoverSubtitle] = useState('A Journey Through Words');
    const [showPageNumbers, setShowPageNumbers] = useState(true);
    const [pageNumberPosition, setPageNumberPosition] = useState('bottom');
    
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const elementRefs = useRef({});

    // Add new page
    const addPage = () => {
        const newPage = {
            id: pages.length + 1,
            elements: [],
            background: '#ffffff',
            pageNumber: pages.length + 1
        };
        setPages([...pages, newPage]);
        setCurrentPageIndex(pages.length);
        toast.success('New page added');
    };

    // Delete page
    const deletePage = (index) => {
        if (pages.length <= 1) {
            toast.error('Cannot delete the only page');
            return;
        }
        const newPages = pages.filter((_, i) => i !== index);
        setPages(newPages);
        if (currentPageIndex >= newPages.length) {
            setCurrentPageIndex(newPages.length - 1);
        }
        toast.success('Page deleted');
    };

    // Duplicate page
    const duplicatePage = (index) => {
        const pageToDuplicate = pages[index];
        const newPage = {
            ...pageToDuplicate,
            id: pages.length + 1,
            pageNumber: pages.length + 1,
            elements: pageToDuplicate.elements.map(el => ({
                ...el,
                id: `el_${Date.now()}_${Math.random()}`
            }))
        };
        const newPages = [...pages];
        newPages.splice(index + 1, 0, newPage);
        setPages(newPages);
        setCurrentPageIndex(index + 1);
        toast.success('Page duplicated');
    };

    // Add text element
    const addTextElement = () => {
        const currentPage = pages[currentPageIndex];
        const newElement = {
            id: `el_${Date.now()}`,
            type: 'text',
            content: 'Double-click to edit text',
            x: 100,
            y: 200,
            width: 400,
            height: 60,
            fontSize: 18,
            fontFamily: 'Georgia, serif',
            color: '#1a1a1a',
            bold: false,
            italic: false,
            underline: false,
            align: 'left',
            backgroundColor: 'transparent'
        };
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].elements.push(newElement);
        setPages(updatedPages);
        setSelectedElement(newElement.id);
        toast.success('Text element added');
    };

    // Add heading element
    const addHeadingElement = () => {
        const currentPage = pages[currentPageIndex];
        const newElement = {
            id: `el_${Date.now()}`,
            type: 'text',
            content: 'Heading',
            x: 100,
            y: 100,
            width: 500,
            height: 50,
            fontSize: 32,
            fontFamily: 'Georgia, serif',
            color: '#1a1a1a',
            bold: true,
            italic: false,
            underline: false,
            align: 'center',
            backgroundColor: 'transparent'
        };
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].elements.push(newElement);
        setPages(updatedPages);
        setSelectedElement(newElement.id);
        toast.success('Heading added');
    };

    // Add image element
    const addImageElement = () => {
        fileInputRef.current.click();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const currentPage = pages[currentPageIndex];
                const maxWidth = 400;
                const maxHeight = 300;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                const newElement = {
                    id: `el_${Date.now()}`,
                    type: 'image',
                    content: event.target.result,
                    x: 150,
                    y: 200 + currentPage.elements.length * 20,
                    width: width,
                    height: height,
                    originalWidth: img.width,
                    originalHeight: img.height
                };
                const updatedPages = [...pages];
                updatedPages[currentPageIndex].elements.push(newElement);
                setPages(updatedPages);
                setSelectedElement(newElement.id);
                toast.success('Image added');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Delete element
    const deleteElement = (elementId) => {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].elements = updatedPages[currentPageIndex].elements.filter(
            el => el.id !== elementId
        );
        setPages(updatedPages);
        setSelectedElement(null);
        toast.success('Element deleted');
    };

    // Handle element selection
    const handleElementClick = (elementId, e) => {
        setSelectedElement(elementId);
        const page = pages[currentPageIndex];
        const element = page.elements.find(el => el.id === elementId);
        if (element && element.type === 'text') {
            setEditContent(element.content);
        }
    };

    // Handle double click to edit text
    const handleElementDoubleClick = (elementId) => {
        const page = pages[currentPageIndex];
        const element = page.elements.find(el => el.id === elementId);
        if (element && element.type === 'text') {
            setEditContent(element.content);
            setIsEditing(true);
            setSelectedElement(elementId);
        }
    };

    // Save edited text
    const saveTextEdit = () => {
        if (selectedElement) {
            const updatedPages = [...pages];
            const element = updatedPages[currentPageIndex].elements.find(
                el => el.id === selectedElement
            );
            if (element) {
                element.content = editContent;
                setPages(updatedPages);
            }
        }
        setIsEditing(false);
        toast.success('Text updated');
    };

    // Update element style
    const updateElementStyle = (styleKey, value) => {
        if (!selectedElement) return;
        const updatedPages = [...pages];
        const element = updatedPages[currentPageIndex].elements.find(
            el => el.id === selectedElement
        );
        if (element) {
            element[styleKey] = value;
            setPages(updatedPages);
        }
    };

    // Move element up/down
    const moveElement = (direction) => {
        if (!selectedElement) return;
        const updatedPages = [...pages];
        const elements = updatedPages[currentPageIndex].elements;
        const index = elements.findIndex(el => el.id === selectedElement);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= elements.length) return;

        [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];
        setPages(updatedPages);
    };

    // Drag and drop handlers
    const handleMouseDown = (e, elementId) => {
        e.stopPropagation();
        const element = pages[currentPageIndex].elements.find(el => el.id === elementId);
        if (!element) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = element.width / rect.width;
        const scaleY = element.height / rect.height;

        setIsDragging(true);
        setDragOffset({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
        setSelectedElement(elementId);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !selectedElement) return;

        const container = canvasRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 1131 / rect.height;

        const x = (e.clientX - rect.left) * scaleX - dragOffset.x;
        const y = (e.clientY - rect.top) * scaleY - dragOffset.y;

        const updatedPages = [...pages];
        const element = updatedPages[currentPageIndex].elements.find(
            el => el.id === selectedElement
        );
        if (element) {
            element.x = Math.max(0, Math.min(800 - element.width, x));
            element.y = Math.max(0, Math.min(1131 - element.height, y));
            setPages(updatedPages);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Resize handlers
    const handleResizeStart = (e, elementId) => {
        e.stopPropagation();
        const element = pages[currentPageIndex].elements.find(el => el.id === elementId);
        if (!element) return;

        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: element.width,
            height: element.height
        });
        setSelectedElement(elementId);
    };

    const handleResizeMove = (e) => {
        if (!isResizing || !selectedElement) return;

        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;

        const updatedPages = [...pages];
        const element = updatedPages[currentPageIndex].elements.find(
            el => el.id === selectedElement
        );
        if (element) {
            const newWidth = Math.max(50, resizeStart.width + dx);
            const newHeight = Math.max(30, resizeStart.height + dy);
            element.width = newWidth;
            element.height = newHeight;
            setPages(updatedPages);
        }
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
    };

    // Update page background
    const updatePageBackground = (color) => {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].background = color;
        setPages(updatedPages);
    };

    // Export as PDF
    const exportAsPDF = async () => {
        try {
            toast.loading('Generating PDF...');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 20;
            
            // Cover page
            pdf.setFillColor(hexToRgb(coverColor));
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            
            pdf.setFontSize(36);
            pdf.setTextColor(hexToRgb(coverTextColor));
            pdf.text(coverTitle, pageWidth / 2, pageHeight / 2 - 40, { align: 'center' });
            
            pdf.setFontSize(20);
            pdf.text(coverSubtitle, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
            
            pdf.setFontSize(16);
            pdf.text(`by ${coverAuthor}`, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' });
            
            // Add pages
            for (let i = 0; i < pages.length; i++) {
                pdf.addPage();
                const page = pages[i];
                
                const container = document.createElement('div');
                container.style.width = '800px';
                container.style.height = '1131px';
                container.style.padding = '60px 80px';
                container.style.background = page.background || '#ffffff';
                container.style.position = 'relative';
                container.style.fontFamily = 'Georgia, serif';
                
                // Add elements
                for (const element of page.elements) {
                    if (element.type === 'text') {
                        const div = document.createElement('div');
                        div.textContent = element.content;
                        div.style.position = 'absolute';
                        div.style.left = element.x + 'px';
                        div.style.top = element.y + 'px';
                        div.style.width = element.width + 'px';
                        div.style.fontSize = element.fontSize + 'px';
                        div.style.fontFamily = element.fontFamily || 'Georgia';
                        div.style.color = element.color || '#1a1a1a';
                        if (element.bold) div.style.fontWeight = 'bold';
                        if (element.italic) div.style.fontStyle = 'italic';
                        if (element.underline) div.style.textDecoration = 'underline';
                        div.style.textAlign = element.align || 'left';
                        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
                            div.style.backgroundColor = element.backgroundColor;
                            div.style.padding = '4px 8px';
                            div.style.borderRadius = '4px';
                        }
                        container.appendChild(div);
                    } else if (element.type === 'image') {
                        const img = document.createElement('img');
                        img.src = element.content;
                        img.style.position = 'absolute';
                        img.style.left = element.x + 'px';
                        img.style.top = element.y + 'px';
                        img.style.width = element.width + 'px';
                        img.style.height = element.height + 'px';
                        img.style.objectFit = 'contain';
                        container.appendChild(img);
                    }
                }

                // Add page number
                if (showPageNumbers) {
                    const pageNum = document.createElement('div');
                    pageNum.textContent = `- ${i + 1} -`;
                    pageNum.style.position = 'absolute';
                    pageNum.style.bottom = '30px';
                    pageNum.style.left = '50%';
                    pageNum.style.transform = 'translateX(-50%)';
                    pageNum.style.fontSize = '12px';
                    pageNum.style.color = '#999';
                    pageNum.style.fontFamily = 'Georgia, serif';
                    container.appendChild(pageNum);
                }
                
                document.body.appendChild(container);
                
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const imgWidth = pageWidth - margin * 2;
                const imgHeight = (canvas.height / canvas.width) * imgWidth;
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
                
                document.body.removeChild(container);
            }
            
            pdf.save(`${coverTitle}.pdf`);
            toast.dismiss();
            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.dismiss();
            toast.error('Failed to export PDF');
        }
    };

    // Helper: hex to rgb for jsPDF
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    // Get current page
    const currentPage = pages[currentPageIndex] || pages[0];

    // Add mouse event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isDragging, isResizing]);

    const currentElement = currentPage.elements.find(el => el.id === selectedElement);

    return (
        <div className="min-h-screen bg-green-50 dark:bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg shadow-green-500/30">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">E-Book Creator</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Professional e-book design tool</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportAsPDF}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-300 hover:scale-105 font-medium flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Cover Page Settings */}
                {showCover && (
                    <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Palette className="w-4 h-4 text-green-600" />
                                Cover Page Settings
                            </h3>
                            <button
                                onClick={() => setShowCover(false)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Cover Color</label>
                                <input
                                    type="color"
                                    value={coverColor}
                                    onChange={(e) => setCoverColor(e.target.value)}
                                    className="w-full h-10 mt-1 rounded-lg cursor-pointer border border-green-200/30 dark:border-green-800/30"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Text Color</label>
                                <input
                                    type="color"
                                    value={coverTextColor}
                                    onChange={(e) => setCoverTextColor(e.target.value)}
                                    className="w-full h-10 mt-1 rounded-lg cursor-pointer border border-green-200/30 dark:border-green-800/30"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input
                                    type="text"
                                    value={coverTitle}
                                    onChange={(e) => setCoverTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 mt-1 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
                                <input
                                    type="text"
                                    value={coverSubtitle}
                                    onChange={(e) => setCoverSubtitle(e.target.value)}
                                    className="w-full px-3 py-1.5 mt-1 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Panel - Tools */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Page Navigation */}
                        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                                <span>Pages</span>
                                <span className="text-xs text-gray-500">{pages.length}</span>
                            </h3>
                            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                                {pages.map((page, index) => (
                                    <button
                                        key={page.id}
                                        onClick={() => setCurrentPageIndex(index)}
                                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                            currentPageIndex === index
                                                ? 'bg-green-600 text-white dark:bg-green-500'
                                                : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1 mt-3 flex-wrap">
                                <button
                                    onClick={addPage}
                                    className="flex-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add
                                </button>
                                <button
                                    onClick={() => duplicatePage(currentPageIndex)}
                                    className="px-2 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-xs"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => deletePage(currentPageIndex)}
                                    className="px-2 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-xs"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Add Elements */}
                        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add Elements</h3>
                            <div className="space-y-1.5">
                                <button
                                    onClick={addHeadingElement}
                                    className="w-full px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                >
                                    <Heading1 className="w-4 h-4" />
                                    Heading
                                </button>
                                <button
                                    onClick={addTextElement}
                                    className="w-full px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                >
                                    <Type className="w-4 h-4" />
                                    Text
                                </button>
                                <button
                                    onClick={addImageElement}
                                    className="w-full px-3 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Image
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Page Settings */}
                        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <PaintBucket className="w-4 h-4 text-green-600" />
                                Page Settings
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Background Color</label>
                                    <input
                                        type="color"
                                        value={currentPage.background}
                                        onChange={(e) => updatePageBackground(e.target.value)}
                                        className="w-full h-8 mt-1 rounded-lg cursor-pointer border border-green-200/30 dark:border-green-800/30"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={showPageNumbers}
                                        onChange={(e) => setShowPageNumbers(e.target.checked)}
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Show page numbers</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center - Canvas */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-green-600" />
                                    Page {currentPageIndex + 1} of {pages.length}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                    >
                                        <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                    >
                                        <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Canvas */}
                            <div 
                                ref={canvasRef}
                                className="relative mx-auto border border-green-200/30 dark:border-green-800/30 rounded-lg overflow-hidden"
                                style={{
                                    width: `${800 * zoom}px`,
                                    height: `${1131 * zoom}px`,
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top left',
                                    background: currentPage.background || '#ffffff',
                                    position: 'relative',
                                    cursor: isDragging ? 'grabbing' : 'default'
                                }}
                            >
                                {/* Page Content */}
                                {currentPage.elements.map((element) => (
                                    <div
                                        key={element.id}
                                        ref={el => elementRefs.current[element.id] = el}
                                        onClick={(e) => handleElementClick(element.id, e)}
                                        onDoubleClick={() => handleElementDoubleClick(element.id)}
                                        onMouseDown={(e) => handleMouseDown(e, element.id)}
                                        className={`absolute cursor-move hover:ring-2 hover:ring-green-400 transition-all ${
                                            selectedElement === element.id ? 'ring-2 ring-green-500 ring-offset-2' : ''
                                        }`}
                                        style={{
                                            left: element.x,
                                            top: element.y,
                                            width: element.width,
                                            height: element.height,
                                            fontSize: element.fontSize || 16,
                                            fontFamily: element.fontFamily || 'Georgia',
                                            color: element.color || '#1a1a1a',
                                            fontWeight: element.bold ? 'bold' : 'normal',
                                            fontStyle: element.italic ? 'italic' : 'normal',
                                            textDecoration: element.underline ? 'underline' : 'none',
                                            textAlign: element.align || 'left',
                                            overflow: 'hidden',
                                            backgroundColor: element.backgroundColor || 'transparent',
                                            padding: element.backgroundColor && element.backgroundColor !== 'transparent' ? '4px 8px' : '0',
                                            borderRadius: element.backgroundColor && element.backgroundColor !== 'transparent' ? '4px' : '0',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {element.type === 'text' ? (
                                            element.content
                                        ) : element.type === 'image' ? (
                                            <img
                                                src={element.content}
                                                alt="Element"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        ) : null}

                                        {/* Resize Handle */}
                                        {selectedElement === element.id && (
                                            <div
                                                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 cursor-se-resize rounded-br"
                                                onMouseDown={(e) => handleResizeStart(e, element.id)}
                                                style={{ cursor: 'se-resize' }}
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* Page Number */}
                                {showPageNumbers && currentPage.elements.length > 0 && (
                                    <div
                                        className="absolute text-gray-400 text-sm"
                                        style={{
                                            bottom: '20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontFamily: 'Georgia, serif'
                                        }}
                                    >
                                        - {currentPageIndex + 1} -
                                    </div>
                                )}

                                {/* Empty State */}
                                {currentPage.elements.length === 0 && (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <div className="text-center">
                                            <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                                            <p className="text-lg">This page is empty</p>
                                            <p className="text-sm">Add elements from the left panel</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Page Navigation */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentPageIndex === 0}
                                    className="px-4 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Page</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={pages.length}
                                        value={currentPageIndex + 1}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val >= 1 && val <= pages.length) {
                                                setCurrentPageIndex(val - 1);
                                            }
                                        }}
                                        className="w-16 px-2 py-1 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white text-center"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">of {pages.length}</span>
                                </div>
                                <button
                                    onClick={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                                    disabled={currentPageIndex === pages.length - 1}
                                    className="px-4 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Formatting */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Selected Element Info */}
                        {selectedElement && currentElement && (
                            <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                                    <span>Element Options</span>
                                    <button
                                        onClick={() => deleteElement(selectedElement)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </h3>
                                <div className="space-y-3">
                                    {/* Font Size */}
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Font Size</label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="72"
                                            value={currentElement.fontSize || 16}
                                            onChange={(e) => updateElementStyle('fontSize', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Text Style */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => updateElementStyle('bold', !currentElement.bold)}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                currentElement.bold
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30'
                                            }`}
                                        >
                                            <Bold className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => updateElementStyle('italic', !currentElement.italic)}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                currentElement.italic
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30'
                                            }`}
                                        >
                                            <Italic className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => updateElementStyle('underline', !currentElement.underline)}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                currentElement.underline
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30'
                                            }`}
                                        >
                                            <Underline className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Alignment */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => updateElementStyle('align', 'left')}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                currentElement.align === 'left'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30'
                                            }`}
                                        >
                                            <AlignLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => updateElementStyle('align', 'center')}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                currentElement.align === 'center'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30'
                                            }`}
                                        >
                                            <AlignCenter className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => updateElementStyle('align', 'right')}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                currentElement.align === 'right'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30'
                                            }`}
                                        >
                                            <AlignRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Text Color</label>
                                        <input
                                            type="color"
                                            value={currentElement.color || '#1a1a1a'}
                                            onChange={(e) => updateElementStyle('color', e.target.value)}
                                            className="w-full h-8 mt-1 rounded-lg cursor-pointer border border-green-200/30 dark:border-green-800/30"
                                        />
                                    </div>

                                    {/* Background Color */}
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Background Color</label>
                                        <input
                                            type="color"
                                            value={currentElement.backgroundColor || '#ffffff'}
                                            onChange={(e) => updateElementStyle('backgroundColor', e.target.value)}
                                            className="w-full h-8 mt-1 rounded-lg cursor-pointer border border-green-200/30 dark:border-green-800/30"
                                        />
                                    </div>

                                    {/* Move */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => moveElement('up')}
                                            className="flex-1 px-2 py-1.5 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs flex items-center justify-center gap-1"
                                        >
                                            <ArrowUp className="w-3 h-3" />
                                            Up
                                        </button>
                                        <button
                                            onClick={() => moveElement('down')}
                                            className="flex-1 px-2 py-1.5 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-xs flex items-center justify-center gap-1"
                                        >
                                            <ArrowDown className="w-3 h-3" />
                                            Down
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Book Stats */}
                        <div className="bg-white dark:bg-black rounded-xl border border-green-200/30 dark:border-green-800/30 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Book Stats</h3>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <p>Pages: <span className="font-medium text-gray-900 dark:text-white">{pages.length}</span></p>
                                <p>Elements: <span className="font-medium text-gray-900 dark:text-white">
                                    {pages.reduce((acc, page) => acc + page.elements.length, 0)}
                                </span></p>
                                <p>Text: <span className="font-medium text-gray-900 dark:text-white">
                                    {pages.reduce((acc, page) => acc + page.elements.filter(el => el.type === 'text').length, 0)}
                                </span></p>
                                <p>Images: <span className="font-medium text-gray-900 dark:text-white">
                                    {pages.reduce((acc, page) => acc + page.elements.filter(el => el.type === 'image').length, 0)}
                                </span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-black rounded-xl border border-green-500/20 p-6 max-w-md w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Text</h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-4 py-2 bg-green-50 dark:bg-black border border-green-200/30 dark:border-green-800/30 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white min-h-[120px]"
                                placeholder="Enter text..."
                            />
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 px-4 py-2 border border-green-200/30 dark:border-green-800/30 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveTextEdit}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 hover:scale-105 font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EBooks;