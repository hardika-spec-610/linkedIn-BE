import PdfPrinter from "pdfmake";
import { format } from "date-fns";


export const getUserCVReadableStream = async (user, Experience) => {
    // Define font files
    const fonts = {
        Courier: {
            normal: "Courier",
            bold: "Courier-Bold",
            italics: "Courier-Oblique",
            bolditalics: "Courier-BoldOblique",
        },
        Helvetica: {
            normal: "Helvetica",
            bold: "Helvetica-Bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-BoldOblique",
        },
    };

    const printer = new PdfPrinter(fonts);

    // Fetch the experiences associated with the user
    const experiences = await Experience.find({ user: user._id });


    const skills = user.skills || [];
    const education = user.education || [];

    const address = user.address || {};
    const addressString = [
        address.street,
        address.city,
        address.state,
        address.zip,
        address.country,
    ].filter((value) => value).join(", ");

    const content = [
        {
            columns: [
                { text: `${user.name} ${user.surname}`, style: "header" },
                { text: user.email, style: "email", alignment: "right" },
            ],
        },
        user.phoneNumber ? { text: user.phoneNumber, style: "subheader" } : {},
        addressString ? { text: addressString, style: "subheader" } : {},
        user.website ? { text: user.website, style: "subheader", link: user.website } : {},
        { text: user.title, style: "subheader" },
        { text: user.area, style: "subheader" },
        { text: "Experiences", style: "sectionTitle", margin: [0, 20, 0, 10] },
        ...experiences.map((experience, index) => ([
            {
                text: `${experience.role} at ${experience.company}`,
                style: "experienceTitle",
                margin: index === 0 ? [0, 0, 0, 5] : [0, 10, 0, 5],
            },
            {
                text: `${format(experience.startDate, "dd/MM/yyyy")} - ${experience.endDate ? format(experience.endDate, "dd/MM/yyyy") : 'Present'}`,
                style: "experienceDate",
            },
            { text: experience.description, style: "experience" },
        ])),
    ];

    const docDefinition = {
        content: content,
        defaultStyle: {
            font: "Helvetica",
        },
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                font: "Courier",
            },
            email: {
                fontSize: 14,
                italics: true,
            },
            subheader: {
                fontSize: 15,
                bold: false,
                margin: [0, 5, 0, 15],
            },
            sectionTitle: {
                fontSize: 16,
                bold: true,
            },
            skills: {
                fontSize: 14,
            },
            educationTitle: {
                fontSize: 14,
                bold: true,
            },
            educationDate: {
                fontSize: 14,
                italics: true,
                margin: [0, 0, 0, 5],
            },
            experienceTitle: {
                fontSize: 14,
                bold: true,
            },
            experienceDate: {
                fontSize: 14,
                italics: true,
                margin: [0, 0, 0, 5],
            },
            experience: {
                fontSize: 14,
            },
        },
    };

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
    pdfReadableStream.end();

    return pdfReadableStream;
};
