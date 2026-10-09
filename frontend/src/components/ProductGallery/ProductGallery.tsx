import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const currentImage = images.includes(selectedImage)
    ? selectedImage
    : images[0] || "";

  return (
    <div className="product-gallery">
      <div className="product-gallery-thumbnails">
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image}-${index}`}
            className={`product-gallery-thumbnail ${
              currentImage === image ? "active" : ""
            }`}
            onClick={() => setSelectedImage(image)}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${productName} ${index + 1}`}
              width={82}
              height={82}
            />
          </button>
        ))}
      </div>

      <div className="product-gallery-main">
        {currentImage ? (
          <img
            src={currentImage}
            alt={productName}
            width={800}
            height={1000}
          />
        ) : (
          <div className="product-gallery-no-image">No Image</div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
