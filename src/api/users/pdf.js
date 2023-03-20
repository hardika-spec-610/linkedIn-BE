import PdfPrinter from "pdfmake";

export const getUserCVReadableStream = (user) => {
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

    const experiences = user.experiences || [];
    const skills = user.skills || [];
    const education = user.education || [];

    const content = [
        {
            columns: [
                { text: `${user.name} ${user.surname}`, style: "header" },
                { text: user.email, style: "email", alignment: "right" },
            ],
        },
        { text: user.phoneNumber, style: "subheader" },
        { text: `${user.address.street}, ${user.address.city}, ${user.address.state}, ${user.address.zip}, ${user.address.country}`, style: "subheader" },
        { text: user.website, style: "subheader", link: user.website },
        { text: user.title, style: "subheader" },
        { text: user.area, style: "subheader" },
        { text: "Skills", style: "sectionTitle", margin: [0, 20, 0, 10] },
        ...skills.map((skill, index) => ([
            {
                text: `${skill.name}: ${skill.level}`,
                style: "skills",
                margin: index === 0 ? [0, 0, 0, 5] : [0, 5, 0, 5],
            },
        ])),
        { text: "Education", style: "sectionTitle", margin: [0, 20, 0, 10] },
        ...education.map((edu, index) => ([
            {
                text: `${edu.degree} - ${edu.institution}`,
                style: "educationTitle",
                margin: index === 0 ? [0, 0, 0, 5] : [0, 10, 0, 5],
            },
            {
                text: `${edu.fieldOfStudy} | ${edu.startDate} - ${edu.endDate || 'Present'}`,
                style: "educationDate",
            },
        ])),
        { text: "Experiences", style: "sectionTitle", margin: [0, 20, 0, 10] },
        ...experiences.map((experience, index) => ([
            {
                text: `${experience.position} at ${experience.company}`,
                style: "experienceTitle",
                margin: index === 0 ? [0, 0, 0, 5] : [0, 10, 0, 5],
            },
            {
                text: `${experience.startDate} - ${experience.endDate || 'Present'}`,
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
