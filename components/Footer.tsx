import {
    FacebookIcon,
    InstagramIcon,
    LinkIcon,
    MailIcon,
    PhoneIcon,
    UserIcon,
    YoutubeIcon,
} from "lucide-react";
import React from "react";
import Link from "next/link";

export const Footer = (): JSX.Element => {
    const contactInfo = {
        title: "Thông tin liên hệ",
        subtitle: "Khoa Công nghệ thông tin và truyền thông",
        items: [
            {
                icon: <MailIcon className="h-6 w-6 text-white" />,
                text: "info@phuongdong.edu.vn",
                href: "mailto:info@phuongdong.edu.vn",
            },
            {
                icon: <PhoneIcon className="h-6 w-6 text-white" />,
                text: "Chưa có",
                href: "tel:=#",
            },
            {
                icon: <UserIcon className="h-6 w-6 text-white" />,
                text: "Trang Quản Trị",
                href: "/admin",
            },

        ],
    };

    const socialMedia = {
        title: "Theo dõi",
        items: [
            {
                icon: <FacebookIcon className="h-6 w-6 text-white" />,
                text: "Facebook",
                href: "https://www.facebook.com/share/1JjzqtQcnU",
            },
            {
                icon: <YoutubeIcon className="h-6 w-6 text-white" />,
                text: "Youtube",
                href: "https://www.youtube.com/@PhuongDongUniversityOfficial",
            },
            {
                icon: <InstagramIcon className="h-6 w-6 text-white" />,
                text: "Instagram",
                href: "https://www.instagram.com/phuongdonguni/",
            },
        ],
    };

    const locations = {
        title: "Cơ sở chính",
        items: [
            {
                title: "Cơ sở 1 (trụ sở)",
                address: "Số 171 phố Trung Kính, phường Yên Hòa, quận Cầu Giấy, Thành phố Hà Nội",
                mapHref: "https://www.google.com/maps?q=21.016614,105.798279",
            },
            {
                title: "Cơ sở 2",
                address: "Số 4, ngõ 228 phố Minh Khai, phường Minh Khai, quận Hai Bà Trưng, Thành phố Hà Nội",
                mapHref: "https://www.google.com/maps?q=21.008714,105.861139",
            },
        ],
    };

    return (
        <>
            <footer className="flex w-full md:items-start md:flex-row flex-col gap-6 px-6 py-12 bg-[#060f51] md:px-[170px] md:pb-[100px] md:pt-[70px]">
                <div className="flex flex-col items-start gap-2 flex-1">
                    <h3 className="font-text-xl-semibold font-[number:var(--text-xl-semibold-font-weight)] text-[#fcfcfc] text-[length:var(--text-xl-semibold-font-size)] tracking-[var(--text-xl-semibold-letter-spacing)] leading-[var(--text-xl-semibold-line-height)] [font-style:var(--text-xl-semibold-font-style)]">
                        {contactInfo.title}
                    </h3>
                    <h4 className="font-text-sm-semibold font-[number:var(--text-sm-semibold-font-weight)] text-[#fcfcfc] text-[length:var(--text-sm-semibold-font-size)] tracking-[var(--text-sm-semibold-letter-spacing)] leading-[var(--text-sm-semibold-line-height)] [font-style:var(--text-sm-semibold-font-style)]">
                        {contactInfo.subtitle}
                    </h4>
                    {contactInfo.items.map((item, index) => (
                        <Link
                            key={`contact-${index}`}
                            href={item.href}
                            className="inline-flex items-center gap-1"
                        >
                            {item.icon}
                            <span className="cursor-pointer font-text-sm-regular font-[number:var(--text-sm-regular-font-weight)] text-[#fcfcfc] text-[length:var(--text-sm-regular-font-size)] tracking-[var(--text-sm-regular-letter-spacing)] leading-[var(--text-sm-regular-line-height)] [font-style:var(--text-sm-regular-font-style)]">
                                {item.text}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col items-start gap-2 flex-1">
                    <h3 className="font-text-xl-semibold font-[number:var(--text-xl-semibold-font-weight)] text-[#fcfcfc] text-[length:var(--text-xl-semibold-font-size)] tracking-[var(--text-xl-semibold-letter-spacing)] leading-[var(--text-xl-semibold-line-height)] [font-style:var(--text-xl-semibold-font-style)]">
                        {socialMedia.title}
                    </h3>

                    {socialMedia.items.map((item, index) => (
                        <Link
                            key={`social-${index}`}
                            href={item.href}
                            className="inline-flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {item.icon}
                            <span className="cursor-pointer font-text-sm-regular font-[number:var(--text-sm-regular-font-weight)] text-[#fcfcfc] text-[length:var(--text-sm-regular-font-size)] tracking-[var(--text-sm-regular-letter-spacing)] leading-[var(--text-sm-regular-line-height)] [font-style:var(--text-sm-regular-font-style)]">
                                {item.text}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col items-start gap-2 flex-1">
                    <h3 className="font-text-xl-semibold font-[number:var(--text-xl-semibold-font-weight)] text-[#fcfcfc] text-[length:var(--text-xl-semibold-font-size)] tracking-[var(--text-xl-semibold-letter-spacing)] leading-[var(--text-xl-semibold-line-height)] [font-style:var(--text-xl-semibold-font-style)]">
                        {locations.title}
                    </h3>

                    {locations.items.map((location, index) => (
                        <div
                            key={`location-${index}`}
                            className="flex flex-col items-start gap-1 w-full"
                        >
                            <h4 className="font-text-sm-semibold font-[number:var(--text-sm-semibold-font-weight)] text-[#fcfcfc] text-[length:var(--text-sm-semibold-font-size)] tracking-[var(--text-sm-semibold-letter-spacing)] leading-[var(--text-sm-semibold-line-height)] [font-style:var(--text-sm-semibold-font-style)]">
                                {location.title}
                            </h4>
                            <Link
                                href={location.mapHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer font-text-sm-regular font-[number:var(--text-sm-regular-font-weight)] text-[#fcfcfc] text-[length:var(--text-sm-regular-font-size)] tracking-[var(--text-sm-regular-letter-spacing)] leading-[var(--text-sm-regular-line-height)] [font-style:var(--text-sm-regular-font-style)]"
                            >
                                {location.address}
                            </Link>
                        </div>
                    ))}
                </div>
            </footer>
        </>
    );
};