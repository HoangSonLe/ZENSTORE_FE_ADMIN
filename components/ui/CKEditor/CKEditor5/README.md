# CKEditor5 Component

A React component that wraps CKEditor5 for rich text editing functionality.

## Features

- Uses CKEditor5 Classic Editor
- Client-side only rendering to avoid SSR issues
- Configurable toolbar with rich formatting options
- Support for basic formatting (bold, italic, underline)
- Support for lists, indentation, and block quotes
- Support for tables and links
- Customizable height

## Usage

```tsx
import ClientSideCustomEditor from "@/components/ui/CKEditor/CKEditor5/ClientSideCustomEditor";

// In your component
const [content, setContent] = useState("<p>Initial content</p>");

const handleEditorChange = (newContent: string) => {
    setContent(newContent);
};

// In your JSX
<ClientSideCustomEditor
  initialData={content}
  onChange={handleEditorChange}
  height="300px"
/>
```

## Props

- `initialData`: The initial HTML content of the editor
- `onChange`: Callback function that receives the updated content
- `height`: Height of the editor (default: "300px")

## Font Features

The toolbar configuration includes font-related features:
- fontfamily
- fontsize
- fontColor
- fontBackgroundColor

**Important Note**: These features are not available in the default CKEditor5 Classic Editor build. To enable them, you need to create a custom build with these plugins.

### Creating a Custom Build with Font Features

1. Follow the [CKEditor5 custom build guide](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#creating-custom-builds)
2. Include the following packages in your custom build:
   - @ckeditor/ckeditor5-font (for font family, size, color, and background color)
   - @ckeditor/ckeditor5-alignment (for text alignment)

3. Install the required packages:
   ```bash
   npm install --save @ckeditor/ckeditor5-font @ckeditor/ckeditor5-alignment
   ```

4. Create a custom build configuration that includes these plugins.

## Limitations

- Some toolbar items may not be available in the default build
- Server-side rendering is disabled to avoid "window is not defined" errors
- Custom builds require additional setup and configuration

## Browser Support

This component should work in all modern browsers, including:
- Chrome
- Firefox
- Safari
- Edge
