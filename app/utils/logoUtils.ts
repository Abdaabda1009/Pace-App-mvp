interface LogoData {
  url: string;
  color: string;
}

const LOGO_API_SECRET_KEY = "sk_GH5uVjkPRGic2ZscGLV6Ag";
const LOGO_API_PUBLIC_KEY = "pk_QxM7ndYgS-6UFUpHdOj_eQ";

const defaultLogoData: LogoData = {
  url: "https://logo.clearbit.com/placeholder.com",
  color: "#2F80ED",
};

export const getLogoData = async (serviceName: string): Promise<LogoData> => {
  try {
    // Format the service name for the API
    const formattedName = serviceName.toLowerCase().replace(/\s+/g, "");

    // First try to get the domain from the search API
    const searchResponse = await fetch(
      `https://api.logo.dev/search?q=${encodeURIComponent(formattedName)}`,
      {
        headers: {
          Authorization: `Bearer: ${LOGO_API_SECRET_KEY}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch logo data");
    }

    const searchData = await searchResponse.json();
    const domain = searchData[0]?.domain || formattedName;

    // Use the domain to get the logo URL
    const logoUrl = `https://img.logo.dev/${domain}?token=${LOGO_API_PUBLIC_KEY}&size=50&format=png`;

    return {
      url: logoUrl,
      color: defaultLogoData.color, // Using default color since the API doesn't provide brand colors
    };
  } catch (error) {
    console.error("Error fetching logo data:", error);
    return defaultLogoData;
  }
};
