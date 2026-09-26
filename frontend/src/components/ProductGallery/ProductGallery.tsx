import { useEffect, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  useEffect(() => {
    setSelectedImage(images[0] || "");
  }, [images]);

  return (
    <div className="product-gallery">
      <div className="product-gallery-thumbnails">
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image}-${index}`}
            className={`product-gallery-thumbnail ${
              selectedImage === image ? "active" : ""
            }`}
            onClick={() => setSelectedImage(image)}
            aria-label={`View image ${index + 1}`}
          >
            <img src={image} alt={`${productName} ${index + 1}`} />
          </button>
        ))}
      </div>

      <div className="product-gallery-main">
        {selectedImage ? (
          <img src={selectedImage} alt={productName} />
        ) : (
          <div className="product-gallery-no-image">No Image</div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
