const LOGO_URL = 'https://res.cloudinary.com/syhhxprd/image/upload/v1792002847/logo_guttwp.jpg';

const MARK_CROP = 'c_crop,x_430,y_108,w_760,h_916';

const build = (transform, width) => LOGO_URL.replace('/upload/', `/upload/${transform ? `${transform}/` : ''}f_auto,q_auto,w_${width}/`);

export default function BrandLogo({ variant = 'mark', size = 40, className = '', alt = 'Cabañas del Sol' }) {
  if (variant === 'full') {
    return (
      <img
        src={build('', size)}
        srcSet={`${build('', size)} 1x, ${build('', size * 2)} 2x`}
        width={size}
        height={size}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }
  const w = Math.round(size * (760 / 916));
  return (
    <img
      src={build(MARK_CROP, w)}
      srcSet={`${build(MARK_CROP, w)} 1x, ${build(MARK_CROP, w * 2)} 2x, ${build(MARK_CROP, w * 3)} 3x`}
      width={w}
      height={size}
      alt={alt}
      decoding="async"
      className={`rounded-[22%] ${className}`}
    />
  );
}
