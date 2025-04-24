# BasicRichText Component

A simple rich text editor component that doesn't require any external dependencies or API keys. This component uses the browser's built-in `contenteditable` and `execCommand` APIs to provide basic rich text editing functionality.

## Features

- No external dependencies or API keys required
- Basic formatting options (bold, italic, underline)
- List support (ordered and unordered)
- Link insertion
- Format clearing
- Customizable height
- Placeholder text support

## Usage

```tsx
import BasicRichText from "@/components/ui/BasicRichText/BasicRichText";

// In your component
const [content, setContent] = useState("<p>Initial content</p>");

const handleEditorChange = (newContent: string) => {
  setContent(newContent);
};

// In your JSX
<BasicRichText
  initialValue={content}
  onChange={handleEditorChange}
  height="300px"
  placeholder="Type your content here..."
/>
```

## Props

- `initialValue`: The initial HTML content of the editor
- `onChange`: Callback function that receives the updated content
- `height`: Height of the editor (default: "300px")
- `placeholder`: Placeholder text when the editor is empty
- `className`: Additional CSS classes to apply to the editor

## Example Implementation

See the following example pages:

- `/basic-richtext-test` - Simple example of the BasicRichText component
- `/basic-richtext-example` - Example of using BasicRichText in a product form

## Advantages Over TinyMCE

- No API key required
- No external dependencies
- Lightweight and fast
- Simple to use and customize
- Works without internet connection
- No licensing restrictions

## Limitations

- Limited formatting options compared to full-featured editors
- No image upload support (though you can paste images)
- No table support
- Limited browser compatibility for some advanced features
- Uses deprecated `execCommand` API (but still widely supported)

## Browser Support

This component should work in all modern browsers, including:

- Chrome
- Firefox
- Safari
- Edge

## Styling

The component includes basic styling in `app/assets/scss/globals.scss`. You can customize the appearance by modifying these styles or adding your own.
