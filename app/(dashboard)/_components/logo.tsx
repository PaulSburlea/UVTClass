import Image from "next/image";

// Componentă pentru afișarea logo-ului aplicației
export const Logo = () => {
    return (
        <Image
            height={50}
            width={50}
            alt="logo"
            src="/logo.svg"
        />  
    )
}
