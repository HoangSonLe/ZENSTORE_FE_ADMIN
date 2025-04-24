# CKEditor Component

A simplified TinyMCE-based rich text editor component that works without requiring an API key. This component provides basic rich text editing functionality while suppressing premium feature notifications.

## Features

-   Uses TinyMCE for rich text editing
-   Works without requiring a TinyMCE API key
-   Rich formatting options (bold, italic, underline, strikethrough)
-   Text alignment options (left, center, right, justify)
-   List support (ordered and unordered)
-   Link insertion
-   Image and media insertion with file picker
-   Table support
-   Fullscreen and preview modes
-   Customizable height
-   Responsive design with sliding toolbar for small screens
-   Mobile-friendly interface with scrolling toolbar
-   Enhanced resize handle for easy editor resizing
-   Improved resize handle visibility and usability
-   Sticky toolbar that remains visible when scrolling
-   Resizable editor with minimum and maximum height constraints
-   Suppresses premium feature notifications

## Usage

```tsx
import CKEditor from "@/components/ui/CKEditor/CKEditor";

// In your component
const [content, setContent] = useState("<p>Initial content</p>");

const handleEditorChange = (newContent: string) => {
    setContent(newContent);
};

// In your JSX
<CKEditor initialValue={content} onChange={handleEditorChange} height="300px" />;
```

## Props

-   `initialValue`: The initial HTML content of the editor
-   `onChange`: Callback function that receives the updated content
-   `height`: Height of the editor (default: "300px")

## How It Works

This component uses TinyMCE but is configured to:

1. Use a simplified toolbar with only the essential formatting options
2. Include only the basic plugins that don't require premium features
3. Suppress notifications about premium features or API key requirements

### Resize Handle Feature

The component includes an enhanced resize handle that allows users to adjust the height of the editor:

1. The resize handle is located in the bottom-right corner of the editor
2. Users can click and drag this handle to resize the editor vertically and horizontally
3. The resize handle has been styled to be more visible and easier to use
4. The editor maintains minimum and maximum height constraints to ensure usability

The component also includes code to intercept and hide any notifications about API keys or premium features, allowing you to use TinyMCE without those distractions.

## Example Implementation

See the following example page:

-   `/ckeditor-test` - Simple example of the CKEditor component

## Advantages

-   Uses the powerful TinyMCE editor
-   WYSIWYG editing experience
-   No API key required
-   Familiar TinyMCE interface
-   Proper rich text editing capabilities

## Limitations

-   Some advanced features are disabled to avoid API key requirements
-   Premium features like spell checking, advanced image editing, etc. are not available
-   Some TinyMCE warnings may still appear in the console

## Browser Support

This component should work in all modern browsers, including:

-   Chrome
-   Firefox
-   Safari
-   Edge
