export type AdditiveRisk = "HAZARDOUS" | "CAUTION" | "SAFE";

export interface AdditiveInfo {
    code: string;
    name: string;
    nameTr: string;
    nameEs: string;
    risk: AdditiveRisk;
    reason: string;
    reasonTr: string;
    reasonEs: string;
    euStatus: "BANNED" | "RESTRICTED" | "ALLOWED";
    fdaStatus: "BANNED" | "WARNING" | "GRAS";
    category:
        | "colorant"
        | "preservative"
        | "antioxidant"
        | "sweetener"
        | "emulsifier"
        | "thickener"
        | "acidity_regulator"
        | "flavor_enhancer"
        | "raising_agent"
        | "glazing_agent"
        | "other";
    categoryTr: string;
    categoryEs: string;
}

export const ADDITIVE_DATABASE: Record<string, AdditiveInfo> = {
    // HAZARDOUS - TEHLİKELİ

    E171: {
        code: "E171",
        name: "Titanium Dioxide",
        nameTr: "Titanyum Dioksit",
        nameEs: "Dióxido de Titanio",
        risk: "HAZARDOUS",
        reason: "Titanium Dioxide is a white colorant that has been banned in the EU since 2022 due to concerns about DNA damage and potential carcinogenic effects. Nanoparticles can accumulate in organs and cross the blood-brain barrier. Studies have shown genotoxic effects in intestinal cells.",
        reasonTr:
            "Titanyum Dioksit, 2022'den bu yana AB'de yasaklanan beyaz bir renklendiricidir. DNA hasarı ve potansiyel kanserojen etkileri nedeniyle endişe yaratmaktadır. Nanopartiküller organlarda birikebilir ve kan-beyin bariyerini geçebilir. Çalışmalar bağırsak hücrelerinde genotoksik etkiler göstermiştir.",
        reasonEs:
            "El Dióxido de Titanio es un colorante blanco que ha sido prohibido en la UE desde 2022 debido a preocupaciones sobre daño al ADN y efectos potencialmente carcinogénicos. Las nanopartículas pueden acumularse en los órganos y cruzar la barrera hematoencefálica. Los estudios han demostrado efectos genotóxicos en células intestinales.",
        euStatus: "BANNED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E249: {
        code: "E249",
        name: "Potassium Nitrite",
        nameTr: "Potasyum Nitrit",
        nameEs: "Nitrito de Potasio",
        risk: "HAZARDOUS",
        reason: "Potassium Nitrite is used as a preservative in processed meats. When heated or combined with amino acids, it can form nitrosamines, which are potent carcinogens linked to colorectal and stomach cancer. The WHO classifies processed meats as Group 1 carcinogens partly due to nitrites.",
        reasonTr:
            "Potasyum Nitrit, işlenmiş etlerde koruyucu olarak kullanılır. Isıtıldığında veya amino asitlerle birleştiğinde, kolorektal ve mide kanseriyle bağlantılı güçlü kanserojenler olan nitrozaminler oluşturabilir. WHO, kısmen nitritler nedeniyle işlenmiş etleri Grup 1 kanserojen olarak sınıflandırmaktadır.",
        reasonEs:
            "El Nitrito de Potasio se utiliza como conservante en carnes procesadas. Cuando se calienta o se combina con aminoácidos, puede formar nitrosaminas, que son potentes carcinógenos relacionados con el cáncer colorrectal y de estómago. La OMS clasifica las carnes procesadas como carcinógenos del Grupo 1 en parte debido a los nitritos.",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
        category: "preservative",
        categoryTr: "Koruyucu",
        categoryEs: "Conservante",
    },
    E250: {
        code: "E250",
        name: "Sodium Nitrite",
        nameTr: "Sodyum Nitrit",
        nameEs: "Nitrito de Sodio",
        risk: "HAZARDOUS",
        reason: "Sodium Nitrite is the most common nitrite preservative in cured meats like bacon, ham, and hot dogs. It gives meat its pink color and prevents bacterial growth. However, it forms carcinogenic nitrosamines during high-heat cooking. Regular consumption of foods containing sodium nitrite is associated with increased cancer risk.",
        reasonTr:
            "Sodyum Nitrit, pastırma, jambon ve sosisli sandviç gibi kürlenmış etlerde en yaygın kullanılan nitrit koruyucusudur. Ete pembe rengini verir ve bakteri üremesini önler. Ancak yüksek ısıda pişirme sırasında kanserojen nitrozaminler oluşturur. Sodyum nitrit içeren gıdaların düzenli tüketimi artan kanser riskiyle ilişkilendirilmektedir.",
        reasonEs:
            "El Nitrito de Sodio es el conservante de nitrito más común en carnes curadas como el tocino, el jamón y los perritos calientes. Da a la carne su color rosado y previene el crecimiento bacteriano. Sin embargo, forma nitrosaminas carcinogénicas durante la cocción a alta temperatura. El consumo regular de alimentos que contienen nitrito de sodio está asociado con un mayor riesgo de cáncer.",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
        category: "preservative",
        categoryTr: "Koruyucu",
        categoryEs: "Conservante",
    },
    E251: {
        code: "E251",
        name: "Sodium Nitrate",
        nameTr: "Sodyum Nitrat",
        nameEs: "Nitrato de Sodio",
        risk: "HAZARDOUS",
        reason: "Sodium Nitrate converts to sodium nitrite in the body and subsequently forms nitrosamines. It's commonly found in cured and processed meats. Long-term consumption has been linked to increased risk of colorectal cancer, pancreatic cancer, and cardiovascular issues due to its effect on blood vessels.",
        reasonTr:
            "Sodyum Nitrat, vücutta sodyum nitrite dönüşür ve ardından nitrozaminler oluşturur. Yaygın olarak kürlenmış ve işlenmiş etlerde bulunur. Uzun süreli tüketim, kan damarları üzerindeki etkisi nedeniyle kolorektal kanser, pankreas kanseri ve kardiyovasküler sorunlar riskinin artmasıyla ilişkilendirilmiştir.",
        reasonEs:
            "El Nitrato de Sodio se convierte en nitrito de sodio en el cuerpo y posteriormente forma nitrosaminas. Se encuentra comúnmente en carnes curadas y procesadas. El consumo a largo plazo se ha relacionado con un mayor riesgo de cáncer colorrectal, cáncer de páncreas y problemas cardiovasculares debido a su efecto en los vasos sanguíneos.",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
        category: "preservative",
        categoryTr: "Koruyucu",
        categoryEs: "Conservante",
    },
    E252: {
        code: "E252",
        name: "Potassium Nitrate",
        nameTr: "Potasyum Nitrat",
        nameEs: "Nitrato de Potasio",
        risk: "HAZARDOUS",
        reason: "Potassium Nitrate, also known as saltpeter, has been used for centuries in meat preservation. Like other nitrates, it converts to nitrite and then potentially to carcinogenic nitrosamines. It can also affect oxygen transport in blood and is particularly concerning for infants and people with certain health conditions.",
        reasonTr:
            "Güherçile olarak da bilinen Potasyum Nitrat, yüzyıllardır et muhafazasında kullanılmaktadır. Diğer nitratlar gibi nitrite, ardından potansiyel olarak kanserojen nitrozaminlere dönüşür. Ayrıca kanda oksijen taşınmasını etkileyebilir ve özellikle bebekler ve belirli sağlık sorunları olan kişiler için endişe vericidir.",
        reasonEs:
            "El Nitrato de Potasio, también conocido como salitre, se ha utilizado durante siglos en la conservación de carnes. Como otros nitratos, se convierte en nitrito y luego potencialmente en nitrosaminas carcinogénicas. También puede afectar el transporte de oxígeno en la sangre y es particularmente preocupante para los bebés y personas con ciertas condiciones de salud.",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
        category: "preservative",
        categoryTr: "Koruyucu",
        categoryEs: "Conservante",
    },
    E127: {
        code: "E127",
        name: "Erythrosine (Red 3)",
        nameTr: "Eritrosin (Kırmızı 3)",
        nameEs: "Eritrosina (Rojo 3)",
        risk: "HAZARDOUS",
        reason: "Erythrosine is a cherry-red synthetic dye that has been shown to cause thyroid tumors in rats. The FDA banned it from cosmetics and externally applied drugs in 1990 but still allows it in food. It contains iodine and can interfere with thyroid function. Many countries have restricted or banned its use.",
        reasonTr:
            "Eritrosin, sıçanlarda tiroid tümörlerine neden olduğu gösterilen kiraz kırmızısı sentetik bir boyadır. FDA, 1990'da kozmetiklerde ve harici ilaçlarda yasaklamış ancak gıdalarda hala izin vermektedir. İyot içerir ve tiroid fonksiyonunu bozabilir. Birçok ülke kullanımını kısıtlamış veya yasaklamıştır.",
        reasonEs:
            "La Eritrosina es un colorante sintético rojo cereza que ha demostrado causar tumores tiroideos en ratas. La FDA lo prohibió en cosméticos y medicamentos de aplicación externa en 1990, pero aún lo permite en alimentos. Contiene yodo y puede interferir con la función tiroidea. Muchos países han restringido o prohibido su uso.",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E131: {
        code: "E131",
        name: "Patent Blue V",
        nameTr: "Patent Mavi V",
        nameEs: "Azul Patente V",
        risk: "HAZARDOUS",
        reason: "Patent Blue V is a synthetic blue dye that has been banned by the FDA due to concerns about allergic reactions, including anaphylaxis. It can cause skin rashes, breathing difficulties, and in rare cases, severe allergic shock. It's still permitted in the EU but must carry warning labels.",
        reasonTr:
            "Patent Mavi V, anafilaksi dahil alerjik reaksiyonlarla ilgili endişeler nedeniyle FDA tarafından yasaklanmış sentetik mavi bir boyadır. Cilt döküntülerine, nefes darlığına ve nadir durumlarda şiddetli alerjik şoka neden olabilir. AB'de hala izinlidir ancak uyarı etiketleri taşıması gerekmektedir.",
        reasonEs:
            "El Azul Patente V es un colorante azul sintético que ha sido prohibido por la FDA debido a preocupaciones sobre reacciones alérgicas, incluyendo anafilaxia. Puede causar erupciones cutáneas, dificultades respiratorias y, en casos raros, choque alérgico severo. Aún está permitido en la UE pero debe llevar etiquetas de advertencia.",
        euStatus: "ALLOWED",
        fdaStatus: "BANNED",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E143: {
        code: "E143",
        name: "Fast Green FCF",
        nameTr: "Hızlı Yeşil FCF",
        nameEs: "Verde Rápido FCF",
        risk: "HAZARDOUS",
        reason: "Fast Green FCF is a turquoise synthetic dye banned in the European Union due to insufficient safety data and concerns about potential carcinogenic effects. Animal studies have raised concerns about tumor development. It remains permitted in the US where it's commonly used in candies and beverages.",
        reasonTr:
            "Hızlı Yeşil FCF, yetersiz güvenlik verileri ve potansiyel kanserojen etkilerle ilgili endişeler nedeniyle Avrupa Birliği'nde yasaklanmış turkuaz sentetik bir boyadır. Hayvan çalışmaları tümör gelişimi konusunda endişelere yol açmıştır. ABD'de izinlidir ve yaygın olarak şekerlemelerde ve içeceklerde kullanılmaktadır.",
        reasonEs:
            "El Verde Rápido FCF es un colorante sintético turquesa prohibido en la Unión Europea debido a datos de seguridad insuficientes y preocupaciones sobre efectos potencialmente carcinogénicos. Los estudios en animales han planteado preocupaciones sobre el desarrollo de tumores. Permanece permitido en EE.UU. donde se usa comúnmente en dulces y bebidas.",
        euStatus: "BANNED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E924: {
        code: "E924",
        name: "Potassium Bromate",
        nameTr: "Potasyum Bromat",
        nameEs: "Bromato de Potasio",
        risk: "HAZARDOUS",
        reason: "Potassium Bromate is a flour improver that has been classified as a possible human carcinogen (Group 2B) by the IARC. It's banned in the EU, UK, Canada, Brazil, and many other countries. It can cause kidney damage and has been linked to thyroid and kidney tumors in animal studies.",
        reasonTr:
            "Potasyum Bromat, IARC tarafından olası insan kanserojen (Grup 2B) olarak sınıflandırılmış bir un iyileştiricidir. AB, İngiltere, Kanada, Brezilya ve diğer birçok ülkede yasaklanmıştır. Böbrek hasarına neden olabilir ve hayvan çalışmalarında tiroid ve böbrek tümörleriyle ilişkilendirilmiştir.",
        reasonEs:
            "El Bromato de Potasio es un mejorador de harina que ha sido clasificado como posible carcinógeno humano (Grupo 2B) por el IARC. Está prohibido en la UE, Reino Unido, Canadá, Brasil y muchos otros países. Puede causar daño renal y se ha relacionado con tumores tiroideos y renales en estudios con animales.",
        euStatus: "BANNED",
        fdaStatus: "BANNED",
        category: "other",
        categoryTr: "Diğer",
        categoryEs: "Otro",
    },
    E925: {
        code: "E925",
        name: "Chlorine",
        nameTr: "Klor",
        nameEs: "Cloro",
        risk: "HAZARDOUS",
        reason: "Chlorine is used to bleach flour and kill bacteria, but it destroys vital nutrients including vitamin E and beta-carotene. It can form harmful chlorinated compounds. The EU has banned chlorine-treated flour since it considers the practice unnecessary and potentially harmful to nutritional value.",
        reasonTr:
            "Klor, unu ağartmak ve bakterileri öldürmek için kullanılır, ancak E vitamini ve beta-karoten dahil hayati besin maddelerini yok eder. Zararlı klorlu bileşikler oluşturabilir. AB, bu uygulamayı gereksiz ve besin değeri için potansiyel olarak zararlı gördüğünden klorla işlenmiş unu yasaklamıştır.",
        reasonEs:
            "El Cloro se utiliza para blanquear harina y matar bacterias, pero destruye nutrientes vitales incluyendo la vitamina E y el beta-caroteno. Puede formar compuestos clorados dañinos. La UE ha prohibido la harina tratada con cloro ya que considera la práctica innecesaria y potencialmente dañina para el valor nutricional.",
        euStatus: "BANNED",
        fdaStatus: "GRAS",
        category: "other",
        categoryTr: "Diğer",
        categoryEs: "Otro",
    },
    E926: {
        code: "E926",
        name: "Chlorine Dioxide",
        nameTr: "Klor Dioksit",
        nameEs: "Dióxido de Cloro",
        risk: "HAZARDOUS",
        reason: "Chlorine Dioxide is a powerful oxidizing agent used to bleach flour and treat water. It destroys vitamins, particularly vitamin E, and essential fatty acids. While less harmful than chlorine gas, it still raises concerns about nutrient loss and the formation of potentially harmful byproducts.",
        reasonTr:
            "Klor Dioksit, unu ağartmak ve suyu arıtmak için kullanılan güçlü bir oksitleyici ajandır. Vitaminleri, özellikle E vitaminini ve esansiyel yağ asitlerini yok eder. Klor gazından daha az zararlı olsa da, besin kaybı ve potansiyel olarak zararlı yan ürünlerin oluşumu konusunda endişelere yol açmaktadır.",
        reasonEs:
            "El Dióxido de Cloro es un potente agente oxidante utilizado para blanquear harina y tratar agua. Destruye vitaminas, particularmente la vitamina E, y ácidos grasos esenciales. Aunque es menos dañino que el gas cloro, aún plantea preocupaciones sobre la pérdida de nutrientes y la formación de subproductos potencialmente dañinos.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "other",
        categoryTr: "Diğer",
        categoryEs: "Otro",
    },

    // CAUTION - DİKKATLİ TÜKETİLMELİ

    E102: {
        code: "E102",
        name: "Tartrazine (Yellow 5)",
        nameTr: "Tartrazin (Sarı 5)",
        nameEs: "Tartrazina (Amarillo 5)",
        risk: "CAUTION",
        reason: "Tartrazine is a bright yellow synthetic dye linked to hyperactivity in children, particularly those with ADHD. It can trigger allergic reactions, especially in aspirin-sensitive individuals. The EU requires warning labels stating it 'may have an adverse effect on activity and attention in children.'",
        reasonTr:
            "Tartrazin, özellikle DEHB'li çocuklarda hiperaktivite ile ilişkilendirilen parlak sarı sentetik bir boyadır. Özellikle aspirine duyarlı bireylerde alerjik reaksiyonları tetikleyebilir. AB, 'çocuklarda aktivite ve dikkat üzerinde olumsuz etkisi olabilir' şeklinde uyarı etiketleri gerektirir.",
        reasonEs:
            "La Tartrazina es un colorante sintético amarillo brillante relacionado con la hiperactividad en niños, particularmente aquellos con TDAH. Puede desencadenar reacciones alérgicas, especialmente en personas sensibles a la aspirina. La UE requiere etiquetas de advertencia que indiquen que 'puede tener efectos adversos sobre la actividad y la atención en los niños'.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E104: {
        code: "E104",
        name: "Quinoline Yellow",
        nameTr: "Kinolin Sarısı",
        nameEs: "Amarillo Quinolina",
        risk: "CAUTION",
        reason: "Quinoline Yellow is a synthetic dye banned in the USA, Australia, Japan, and Norway. Studies suggest it may cause hyperactivity and attention problems in children. In the EU, products containing it must carry warnings. It's often found in smoked fish, ice cream, and scotch eggs.",
        reasonTr:
            "Kinolin Sarısı, ABD, Avustralya, Japonya ve Norveç'te yasaklanmış sentetik bir boyadır. Çalışmalar, çocuklarda hiperaktivite ve dikkat sorunlarına neden olabileceğini göstermektedir. AB'de bunu içeren ürünler uyarı taşımalıdır. Genellikle füme balık, dondurma ve İskoç yumurtasında bulunur.",
        reasonEs:
            "El Amarillo Quinolina es un colorante sintético prohibido en EE.UU., Australia, Japón y Noruega. Los estudios sugieren que puede causar hiperactividad y problemas de atención en niños. En la UE, los productos que lo contienen deben llevar advertencias. Se encuentra a menudo en pescado ahumado, helados y huevos escoceses.",
        euStatus: "RESTRICTED",
        fdaStatus: "BANNED",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E110: {
        code: "E110",
        name: "Sunset Yellow (Yellow 6)",
        nameTr: "Gün Batımı Sarısı (Sarı 6)",
        nameEs: "Amarillo Atardecer (Amarillo 6)",
        risk: "CAUTION",
        reason: "Sunset Yellow is an orange-yellow dye commonly found in soft drinks, candies, and snacks. Multiple studies have linked it to hyperactivity in children. It may also cause allergic reactions including hives and nasal congestion. The EU requires mandatory warning labels on products containing this dye.",
        reasonTr:
            "Gün Batımı Sarısı, yaygın olarak meşrubatlarda, şekerlemelerde ve atıştırmalıklarda bulunan turuncu-sarı bir boyadır. Çok sayıda çalışma, çocuklarda hiperaktivite ile ilişkilendirmiştir. Ayrıca kurdeşen ve burun tıkanıklığı dahil alerjik reaksiyonlara neden olabilir. AB, bu boyayı içeren ürünlerde zorunlu uyarı etiketleri gerektirir.",
        reasonEs:
            "El Amarillo Atardecer es un colorante naranja-amarillo comúnmente encontrado en refrescos, dulces y bocadillos. Múltiples estudios lo han relacionado con la hiperactividad en niños. También puede causar reacciones alérgicas incluyendo urticaria y congestión nasal. La UE requiere etiquetas de advertencia obligatorias en productos que contienen este colorante.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E122: {
        code: "E122",
        name: "Carmoisine (Azorubine)",
        nameTr: "Karmoisin (Azorubin)",
        nameEs: "Carmoisina (Azorrubina)",
        risk: "CAUTION",
        reason: "Carmoisine is a red synthetic dye banned in the USA, Japan, and several other countries. It's associated with allergic reactions, particularly in people sensitive to aspirin, and can trigger asthma attacks. Studies have also linked it to hyperactivity in children.",
        reasonTr:
            "Karmoisin, ABD, Japonya ve diğer birçok ülkede yasaklanmış kırmızı sentetik bir boyadır. Özellikle aspirine duyarlı kişilerde alerjik reaksiyonlarla ilişkilendirilir ve astım ataklarını tetikleyebilir. Çalışmalar ayrıca çocuklarda hiperaktivite ile ilişkilendirmiştir.",
        reasonEs:
            "La Carmoisina es un colorante sintético rojo prohibido en EE.UU., Japón y varios otros países. Está asociada con reacciones alérgicas, particularmente en personas sensibles a la aspirina, y puede desencadenar ataques de asma. Los estudios también la han relacionado con la hiperactividad en niños.",
        euStatus: "RESTRICTED",
        fdaStatus: "BANNED",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E124: {
        code: "E124",
        name: "Ponceau 4R (Red 7)",
        nameTr: "Ponso 4R (Kırmızı 7)",
        nameEs: "Ponceau 4R (Rojo 7)",
        risk: "CAUTION",
        reason: "Ponceau 4R is a strawberry-red synthetic dye banned in the USA and Norway. It's one of the 'Southampton Six' dyes linked to hyperactivity in children. It can cause allergic reactions and is not recommended for children or people with aspirin sensitivity or asthma.",
        reasonTr:
            "Ponso 4R, ABD ve Norveç'te yasaklanmış çilek kırmızısı sentetik bir boyadır. Çocuklarda hiperaktivite ile ilişkilendirilen 'Southampton Altılısı' boyalardan biridir. Alerjik reaksiyonlara neden olabilir ve çocuklar veya aspirin hassasiyeti ya da astımı olan kişiler için önerilmez.",
        reasonEs:
            "El Ponceau 4R es un colorante sintético rojo fresa prohibido en EE.UU. y Noruega. Es uno de los colorantes 'Seis de Southampton' relacionados con la hiperactividad en niños. Puede causar reacciones alérgicas y no se recomienda para niños o personas con sensibilidad a la aspirina o asma.",
        euStatus: "RESTRICTED",
        fdaStatus: "BANNED",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E129: {
        code: "E129",
        name: "Allura Red (Red 40)",
        nameTr: "Allura Kırmızısı (Kırmızı 40)",
        nameEs: "Rojo Allura (Rojo 40)",
        risk: "CAUTION",
        reason: "Allura Red is the most widely used red dye in the food industry. Studies have linked it to hyperactivity and behavioral problems in children. Recent research suggests it may increase intestinal inflammation and affect gut bacteria. The EU requires warning labels, while some countries have banned it entirely.",
        reasonTr:
            "Allura Kırmızısı, gıda endüstrisinde en yaygın kullanılan kırmızı boyadır. Çalışmalar, çocuklarda hiperaktivite ve davranış sorunlarıyla ilişkilendirmiştir. Son araştırmalar, bağırsak iltihabını artırabileceğini ve bağırsak bakterilerini etkileyebileceğini göstermektedir. AB uyarı etiketleri gerektirirken, bazı ülkeler tamamen yasaklamıştır.",
        reasonEs:
            "El Rojo Allura es el colorante rojo más ampliamente utilizado en la industria alimentaria. Los estudios lo han relacionado con la hiperactividad y problemas de comportamiento en niños. Investigaciones recientes sugieren que puede aumentar la inflamación intestinal y afectar las bacterias intestinales. La UE requiere etiquetas de advertencia, mientras que algunos países lo han prohibido completamente.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E133: {
        code: "E133",
        name: "Brilliant Blue FCF",
        nameTr: "Parlak Mavi FCF",
        nameEs: "Azul Brillante FCF",
        risk: "CAUTION",
        reason: "Brilliant Blue is a synthetic dye that can cause allergic reactions in sensitive individuals, including hives, asthma, and hay fever. Some studies suggest it may be able to cross the blood-brain barrier. It's commonly found in candies, beverages, and ice cream.",
        reasonTr:
            "Parlak Mavi, hassas bireylerde kurdeşen, astım ve saman nezlesi dahil alerjik reaksiyonlara neden olabilen sentetik bir boyadır. Bazı çalışmalar kan-beyin bariyerini geçebileceğini göstermektedir. Yaygın olarak şekerlemelerde, içeceklerde ve dondurmada bulunur.",
        reasonEs:
            "El Azul Brillante es un colorante sintético que puede causar reacciones alérgicas en personas sensibles, incluyendo urticaria, asma y fiebre del heno. Algunos estudios sugieren que puede ser capaz de cruzar la barrera hematoencefálica. Se encuentra comúnmente en dulces, bebidas y helados.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E150C: {
        code: "E150C",
        name: "Ammonia Caramel",
        nameTr: "Amonyak Karameli",
        nameEs: "Caramelo Amoniacal",
        risk: "CAUTION",
        reason: "Ammonia Caramel is produced by heating sugar with ammonia compounds. This process creates 4-methylimidazole (4-MEI), a chemical classified as a possible carcinogen. It's commonly found in cola drinks, soy sauce, and dark beers. California requires cancer warning labels on products with high 4-MEI levels.",
        reasonTr:
            "Amonyak Karameli, şekerin amonyak bileşikleriyle ısıtılmasıyla üretilir. Bu işlem, olası kanserojen olarak sınıflandırılan 4-metilimidazol (4-MEI) oluşturur. Yaygın olarak kolalı içeceklerde, soya sosunda ve koyu biralarda bulunur. Kaliforniya, yüksek 4-MEI seviyeli ürünlerde kanser uyarı etiketleri gerektirir.",
        reasonEs:
            "El Caramelo Amoniacal se produce calentando azúcar con compuestos de amoníaco. Este proceso crea 4-metilimidazol (4-MEI), un químico clasificado como posible carcinógeno. Se encuentra comúnmente en bebidas de cola, salsa de soja y cervezas oscuras. California requiere etiquetas de advertencia de cáncer en productos con niveles altos de 4-MEI.",
        euStatus: "ALLOWED",
        fdaStatus: "WARNING",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E150D: {
        code: "E150D",
        name: "Sulphite Ammonia Caramel",
        nameTr: "Sülfit Amonyak Karameli",
        nameEs: "Caramelo Amoniacal Sulfítico",
        risk: "CAUTION",
        reason: "Sulphite Ammonia Caramel is the most commonly used caramel color, found in most cola drinks worldwide. Like E150c, it contains 4-MEI, a potential carcinogen. Studies have shown that regular consumption of products high in this additive may pose long-term health risks.",
        reasonTr:
            "Sülfit Amonyak Karameli, dünya genelinde çoğu kolalı içecekte bulunan en yaygın kullanılan karamel renklendiricidir. E150c gibi, potansiyel kanserojen olan 4-MEI içerir. Çalışmalar, bu katkı maddesinin yüksek olduğu ürünlerin düzenli tüketiminin uzun vadeli sağlık riskleri oluşturabileceğini göstermiştir.",
        reasonEs:
            "El Caramelo Amoniacal Sulfítico es el colorante de caramelo más comúnmente utilizado, encontrado en la mayoría de las bebidas de cola en todo el mundo. Como el E150c, contiene 4-MEI, un posible carcinógeno. Los estudios han demostrado que el consumo regular de productos altos en este aditivo puede plantear riesgos para la salud a largo plazo.",
        euStatus: "ALLOWED",
        fdaStatus: "WARNING",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E211: {
        code: "E211",
        name: "Sodium Benzoate",
        nameTr: "Sodyum Benzoat",
        nameEs: "Benzoato de Sodio",
        risk: "CAUTION",
        reason: "Sodium Benzoate is a preservative that can react with vitamin C (ascorbic acid) to form benzene, a known carcinogen. This reaction is accelerated by heat and light. It has also been linked to hyperactivity in children and can trigger allergies in sensitive individuals. Common in soft drinks and acidic foods.",
        reasonTr:
            "Sodyum Benzoat, bilinen bir kanserojen olan benzen oluşturmak için C vitamini (askorbik asit) ile reaksiyona girebilen bir koruyucudur. Bu reaksiyon ısı ve ışıkla hızlanır. Ayrıca çocuklarda hiperaktivite ile ilişkilendirilmiş ve hassas bireylerde alerjileri tetikleyebilir. Meşrubatlarda ve asitli gıdalarda yaygındır.",
        reasonEs:
            "El Benzoato de Sodio es un conservante que puede reaccionar con la vitamina C (ácido ascórbico) para formar benceno, un conocido carcinógeno. Esta reacción se acelera con el calor y la luz. También se ha relacionado con la hiperactividad en niños y puede desencadenar alergias en personas sensibles. Común en refrescos y alimentos ácidos.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "preservative",
        categoryTr: "Koruyucu",
        categoryEs: "Conservante",
    },
    E320: {
        code: "E320",
        name: "Butylated Hydroxyanisole (BHA)",
        nameTr: "Bütillenmiş Hidroksianisol (BHA)",
        nameEs: "Hidroxianisol Butilado (BHA)",
        risk: "CAUTION",
        reason: "BHA is an antioxidant preservative classified as 'reasonably anticipated to be a human carcinogen' by the US National Toxicology Program. It can cause allergic reactions and has been shown to affect hormones. It's commonly found in chips, cereals, and chewing gum. Several countries have restricted its use.",
        reasonTr:
            "BHA, ABD Ulusal Toksikoloji Programı tarafından 'makul olarak insan kanserojen olması beklenen' olarak sınıflandırılan antioksidan bir koruyucudur. Alerjik reaksiyonlara neden olabilir ve hormonları etkilediği gösterilmiştir. Yaygın olarak cipslerde, tahıllarda ve sakızda bulunur. Birçok ülke kullanımını kısıtlamıştır.",
        reasonEs:
            "El BHA es un conservante antioxidante clasificado como 'razonablemente anticipado como carcinógeno humano' por el Programa Nacional de Toxicología de EE.UU. Puede causar reacciones alérgicas y se ha demostrado que afecta las hormonas. Se encuentra comúnmente en papas fritas, cereales y chicle. Varios países han restringido su uso.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "antioxidant",
        categoryTr: "Antioksidan",
        categoryEs: "Antioxidante",
    },
    E321: {
        code: "E321",
        name: "Butylated Hydroxytoluene (BHT)",
        nameTr: "Bütillenmiş Hidroksitoluen (BHT)",
        nameEs: "Hidroxitolueno Butilado (BHT)",
        risk: "CAUTION",
        reason: "BHT is closely related to BHA and shares similar concerns. It's suspected of being an endocrine disruptor, potentially affecting thyroid hormone levels. Some studies have linked it to tumor promotion in animals. It can cause allergic skin reactions and is banned in food in Japan and some European countries.",
        reasonTr:
            "BHT, BHA ile yakından ilişkilidir ve benzer endişeleri paylaşır. Potansiyel olarak tiroid hormon seviyelerini etkileyen endokrin bozucu olduğundan şüphelenilmektedir. Bazı çalışmalar, hayvanlarda tümör gelişimiyle ilişkilendirmiştir. Alerjik cilt reaksiyonlarına neden olabilir ve Japonya ile bazı Avrupa ülkelerinde gıdalarda yasaklanmıştır.",
        reasonEs:
            "El BHT está estrechamente relacionado con el BHA y comparte preocupaciones similares. Se sospecha que es un disruptor endocrino, afectando potencialmente los niveles de hormonas tiroideas. Algunos estudios lo han relacionado con la promoción de tumores en animales. Puede causar reacciones alérgicas en la piel y está prohibido en alimentos en Japón y algunos países europeos.",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
        category: "antioxidant",
        categoryTr: "Antioksidan",
        categoryEs: "Antioxidante",
    },
    E407: {
        code: "E407",
        name: "Carrageenan",
        nameTr: "Karragenan",
        nameEs: "Carragenina",
        risk: "CAUTION",
        reason: "Carrageenan is derived from seaweed and used as a thickener. While naturally sourced, degraded carrageenan has been linked to intestinal inflammation, ulcers, and potentially colon cancer. Some studies suggest even food-grade carrageenan may cause digestive issues in sensitive individuals. It's common in dairy alternatives and processed foods.",
        reasonTr:
            "Karragenan, deniz yosunundan elde edilir ve kıvam arttırıcı olarak kullanılır. Doğal kaynaklı olmasına rağmen, bozunmuş karragenan bağırsak iltihabı, ülser ve potansiyel olarak kolon kanseri ile ilişkilendirilmiştir. Bazı çalışmalar, gıda kalitesindeki karragenanın bile hassas bireylerde sindirim sorunlarına neden olabileceğini göstermektedir.",
        reasonEs:
            "La Carragenina se deriva del alga marina y se usa como espesante. Aunque es de origen natural, la carragenina degradada se ha relacionado con inflamación intestinal, úlceras y potencialmente cáncer de colon. Algunos estudios sugieren que incluso la carragenina de grado alimenticio puede causar problemas digestivos en personas sensibles. Es común en alternativas lácteas y alimentos procesados.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E450: {
        code: "E450",
        name: "Diphosphates",
        nameTr: "Difosfatlar",
        nameEs: "Difosfatos",
        risk: "CAUTION",
        reason: "Diphosphates are commonly used in processed meats, baked goods, and cheese products. Excessive phosphate intake can disrupt calcium balance, potentially weakening bones. High phosphate consumption has been linked to increased cardiovascular risk and kidney strain. People with kidney problems should limit intake.",
        reasonTr:
            "Difosfatlar, yaygın olarak işlenmiş etlerde, unlu mamullerde ve peynir ürünlerinde kullanılır. Aşırı fosfat alımı kalsiyum dengesini bozabilir ve potansiyel olarak kemikleri zayıflatabilir. Yüksek fosfat tüketimi, artan kardiyovasküler risk ve böbrek yükü ile ilişkilendirilmiştir. Böbrek sorunu olan kişiler alımı sınırlamalıdır.",
        reasonEs:
            "Los Difosfatos se usan comúnmente en carnes procesadas, productos horneados y productos de queso. La ingesta excesiva de fosfato puede alterar el equilibrio de calcio, debilitando potencialmente los huesos. El consumo alto de fosfato se ha relacionado con un mayor riesgo cardiovascular y carga renal. Las personas con problemas renales deben limitar su ingesta.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E451: {
        code: "E451",
        name: "Triphosphates",
        nameTr: "Trifosfatlar",
        nameEs: "Trifosfatos",
        risk: "CAUTION",
        reason: "Triphosphates are used to retain moisture in processed meats and seafood. Like other phosphates, they can interfere with calcium and magnesium absorption, potentially affecting bone health. High consumption may contribute to mineral imbalances and has been associated with cardiovascular concerns in people with kidney disease.",
        reasonTr:
            "Trifosfatlar, işlenmiş etlerde ve deniz ürünlerinde nemi tutmak için kullanılır. Diğer fosfatlar gibi, kalsiyum ve magnezyum emilimini engelleyebilir ve potansiyel olarak kemik sağlığını etkileyebilir. Yüksek tüketim mineral dengesizliklerine katkıda bulunabilir ve böbrek hastalığı olan kişilerde kardiyovasküler endişelerle ilişkilendirilmiştir.",
        reasonEs:
            "Los Trifosfatos se utilizan para retener humedad en carnes procesadas y mariscos. Como otros fosfatos, pueden interferir con la absorción de calcio y magnesio, afectando potencialmente la salud ósea. El consumo alto puede contribuir a desequilibrios minerales y se ha asociado con preocupaciones cardiovasculares en personas con enfermedad renal.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E452: {
        code: "E452",
        name: "Polyphosphates",
        nameTr: "Polifosfatlar",
        nameEs: "Polifosfatos",
        risk: "CAUTION",
        reason: "Polyphosphates are widely used in processed foods to improve texture and extend shelf life. They can bind to calcium in the digestive tract, reducing absorption and potentially contributing to calcium deficiency over time. Research suggests excessive phosphate intake may accelerate aging of blood vessels.",
        reasonTr:
            "Polifosfatlar, dokuyu iyileştirmek ve raf ömrünü uzatmak için işlenmiş gıdalarda yaygın olarak kullanılır. Sindirim sisteminde kalsiyuma bağlanabilir, emilimi azaltabilir ve zamanla potansiyel olarak kalsiyum eksikliğine katkıda bulunabilir. Araştırmalar, aşırı fosfat alımının kan damarlarının yaşlanmasını hızlandırabileceğini göstermektedir.",
        reasonEs:
            "Los Polifosfatos se usan ampliamente en alimentos procesados para mejorar la textura y extender la vida útil. Pueden unirse al calcio en el tracto digestivo, reduciendo la absorción y contribuyendo potencialmente a la deficiencia de calcio con el tiempo. La investigación sugiere que la ingesta excesiva de fosfato puede acelerar el envejecimiento de los vasos sanguíneos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E621: {
        code: "E621",
        name: "Monosodium Glutamate (MSG)",
        nameTr: "Monosodyum Glutamat (MSG)",
        nameEs: "Glutamato Monosódico (MSG)",
        risk: "CAUTION",
        reason: "MSG is a flavor enhancer that can cause 'Chinese Restaurant Syndrome' in sensitive individuals, with symptoms including headaches, flushing, sweating, and chest pain. While generally recognized as safe, some people report adverse reactions. It may also contribute to overeating by making food more palatable.",
        reasonTr:
            "MSG, hassas bireylerde baş ağrısı, yüz kızarması, terleme ve göğüs ağrısı gibi semptomlarla 'Çin Restoranı Sendromu'na neden olabilen bir lezzet arttırıcıdır. Genel olarak güvenli kabul edilse de, bazı kişiler olumsuz reaksiyonlar bildirmektedir. Ayrıca yiyecekleri daha lezzetli hale getirerek aşırı yemeye katkıda bulunabilir.",
        reasonEs:
            "El MSG es un potenciador del sabor que puede causar el 'Síndrome del Restaurante Chino' en personas sensibles, con síntomas que incluyen dolores de cabeza, enrojecimiento, sudoración y dolor de pecho. Aunque generalmente se reconoce como seguro, algunas personas reportan reacciones adversas. También puede contribuir a la sobrealimentación al hacer que los alimentos sean más palatables.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "flavor_enhancer",
        categoryTr: "Lezzet Arttırıcı",
        categoryEs: "Potenciador del sabor",
    },
    E951: {
        code: "E951",
        name: "Aspartame",
        nameTr: "Aspartam",
        nameEs: "Aspartamo",
        risk: "CAUTION",
        reason: "Aspartame is an artificial sweetener that is dangerous for people with phenylketonuria (PKU), a genetic disorder. Products containing it must carry PKU warnings. Some studies have raised concerns about potential links to headaches, mood changes, and cancer, though regulatory bodies consider it safe at approved levels.",
        reasonTr:
            "Aspartam, genetik bir bozukluk olan fenilketonüri (PKU) hastası kişiler için tehlikeli olan yapay bir tatlandırıcıdır. İçeren ürünler PKU uyarıları taşımalıdır. Bazı çalışmalar baş ağrısı, ruh hali değişiklikleri ve kanserle potansiyel bağlantılar konusunda endişelere yol açmıştır, ancak düzenleyici kurumlar onaylı seviyelerde güvenli kabul etmektedir.",
        reasonEs:
            "El Aspartamo es un edulcorante artificial que es peligroso para personas con fenilcetonuria (PKU), un trastorno genético. Los productos que lo contienen deben llevar advertencias de PKU. Algunos estudios han planteado preocupaciones sobre posibles vínculos con dolores de cabeza, cambios de humor y cáncer, aunque los organismos reguladores lo consideran seguro a niveles aprobados.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "sweetener",
        categoryTr: "Tatlandırıcı",
        categoryEs: "Edulcorante",
    },
    E950: {
        code: "E950",
        name: "Acesulfame Potassium (Ace-K)",
        nameTr: "Asesülfam Potasyum (Ace-K)",
        nameEs: "Acesulfamo Potásico (Ace-K)",
        risk: "CAUTION",
        reason: "Acesulfame K is an artificial sweetener often combined with other sweeteners. Some animal studies have raised concerns about potential carcinogenic effects, though these findings are debated. The long-term effects of regular consumption are not fully understood. It contains methylene chloride, a potential carcinogen.",
        reasonTr:
            "Asesülfam K, genellikle diğer tatlandırıcılarla birleştirilen yapay bir tatlandırıcıdır. Bazı hayvan çalışmaları potansiyel kanserojen etkiler konusunda endişelere yol açmıştır, ancak bu bulgular tartışmalıdır. Düzenli tüketimin uzun vadeli etkileri tam olarak anlaşılamamıştır. Potansiyel kanserojen olan metilen klorür içerir.",
        reasonEs:
            "El Acesulfamo Potásico es un edulcorante artificial que a menudo se combina con otros edulcorantes. Algunos estudios en animales han planteado preocupaciones sobre posibles efectos carcinogénicos, aunque estos hallazgos son debatidos. Los efectos a largo plazo del consumo regular no se comprenden completamente. Contiene cloruro de metileno, un posible carcinógeno.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "sweetener",
        categoryTr: "Tatlandırıcı",
        categoryEs: "Edulcorante",
    },
    E955: {
        code: "E955",
        name: "Sucralose",
        nameTr: "Sukraloz",
        nameEs: "Sucralosa",
        risk: "CAUTION",
        reason: "Sucralose is a zero-calorie sweetener that recent studies suggest may negatively affect gut bacteria and glucose metabolism. When heated, it can break down into potentially harmful chlorinated compounds. Some research indicates it may not be as metabolically inert as once believed.",
        reasonTr:
            "Sukraloz, son çalışmaların bağırsak bakterilerini ve glikoz metabolizmasını olumsuz etkileyebileceğini gösterdiği sıfır kalorili bir tatlandırıcıdır. Isıtıldığında potansiyel olarak zararlı klorlu bileşiklere parçalanabilir. Bazı araştırmalar, bir zamanlar inanıldığı kadar metabolik olarak etkisiz olmayabileceğini göstermektedir.",
        reasonEs:
            "La Sucralosa es un edulcorante sin calorías que estudios recientes sugieren puede afectar negativamente las bacterias intestinales y el metabolismo de la glucosa. Cuando se calienta, puede descomponerse en compuestos clorados potencialmente dañinos. Algunas investigaciones indican que puede no ser tan metabólicamente inerte como se creía una vez.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "sweetener",
        categoryTr: "Tatlandırıcı",
        categoryEs: "Edulcorante",
    },

    // SAFE - GÜVENLİ

    E100: {
        code: "E100",
        name: "Curcumin",
        nameTr: "Kurkumin",
        nameEs: "Curcumina",
        risk: "SAFE",
        reason: "Curcumin is the natural yellow pigment found in turmeric. It has powerful anti-inflammatory and antioxidant properties and has been used in traditional medicine for thousands of years. Studies suggest it may help protect against heart disease, Alzheimer's, and cancer. It's one of the safest food colorants available.",
        reasonTr:
            "Kurkumin, zerdeçalda bulunan doğal sarı pigmenttir. Güçlü anti-inflamatuar ve antioksidan özelliklere sahiptir ve geleneksel tıpta binlerce yıldır kullanılmaktadır. Çalışmalar kalp hastalığı, Alzheimer ve kansere karşı korumaya yardımcı olabileceğini göstermektedir. Mevcut en güvenli gıda renklendiricilerinden biridir.",
        reasonEs:
            "La Curcumina es el pigmento amarillo natural que se encuentra en la cúrcuma. Tiene poderosas propiedades antiinflamatorias y antioxidantes y se ha utilizado en la medicina tradicional durante miles de años. Los estudios sugieren que puede ayudar a proteger contra enfermedades cardíacas, Alzheimer y cáncer. Es uno de los colorantes alimentarios más seguros disponibles.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E101: {
        code: "E101",
        name: "Riboflavin (Vitamin B2)",
        nameTr: "Riboflavin (B2 Vitamini)",
        nameEs: "Riboflavina (Vitamina B2)",
        risk: "SAFE",
        reason: "Riboflavin is vitamin B2, an essential nutrient that gives foods a yellow color. It plays a crucial role in energy production and cellular function. As a vitamin, it's not only safe but beneficial to health. Excess amounts are simply excreted in urine, giving it a bright yellow color.",
        reasonTr:
            "Riboflavin, gıdalara sarı renk veren temel bir besin olan B2 vitaminidir. Enerji üretiminde ve hücresel fonksiyonda önemli bir rol oynar. Bir vitamin olarak sadece güvenli değil, aynı zamanda sağlığa faydalıdır. Fazla miktarlar basitçe idrarla atılır ve parlak sarı bir renk verir.",
        reasonEs:
            "La Riboflavina es la vitamina B2, un nutriente esencial que da a los alimentos un color amarillo. Juega un papel crucial en la producción de energía y la función celular. Como vitamina, no solo es segura sino beneficiosa para la salud. Los excesos se excretan simplemente en la orina, dándole un color amarillo brillante.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E160A: {
        code: "E160A",
        name: "Beta-Carotene",
        nameTr: "Beta-Karoten",
        nameEs: "Betacaroteno",
        risk: "SAFE",
        reason: "Beta-Carotene is the natural orange pigment found in carrots, sweet potatoes, and other vegetables. The body converts it to vitamin A as needed, making it a safe source of this essential nutrient. It's a powerful antioxidant that may help protect against certain cancers and eye diseases.",
        reasonTr:
            "Beta-Karoten, havuç, tatlı patates ve diğer sebzelerde bulunan doğal turuncu pigmenttir. Vücut gerektiğinde A vitaminine dönüştürür, bu da onu bu temel besinin güvenli bir kaynağı yapar. Belirli kanserlere ve göz hastalıklarına karşı korumaya yardımcı olabilecek güçlü bir antioksidandır.",
        reasonEs:
            "El Betacaroteno es el pigmento naranja natural que se encuentra en zanahorias, batatas y otras verduras. El cuerpo lo convierte en vitamina A según sea necesario, haciéndolo una fuente segura de este nutriente esencial. Es un poderoso antioxidante que puede ayudar a proteger contra ciertos cánceres y enfermedades oculares.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E160C: {
        code: "E160C",
        name: "Paprika Extract",
        nameTr: "Kırmızı Biber Özütü",
        nameEs: "Extracto de Pimentón",
        risk: "SAFE",
        reason: "Paprika Extract is a natural red-orange colorant derived from sweet red peppers. It contains beneficial carotenoids and has antioxidant properties. It's commonly used to add color to cheeses, sauces, and snacks. As a natural plant extract, it's considered very safe for consumption.",
        reasonTr:
            "Kırmızı Biber Özütü, tatlı kırmızı biberlerden elde edilen doğal kırmızı-turuncu bir renklendiricidir. Faydalı karotenoidler içerir ve antioksidan özelliklere sahiptir. Yaygın olarak peynirlere, soslara ve atıştırmalıklara renk katmak için kullanılır. Doğal bir bitki özütü olarak tüketim için çok güvenli kabul edilir.",
        reasonEs:
            "El Extracto de Pimentón es un colorante natural rojo-naranja derivado de pimientos rojos dulces. Contiene carotenoides beneficiosos y tiene propiedades antioxidantes. Se usa comúnmente para añadir color a quesos, salsas y bocadillos. Como extracto vegetal natural, se considera muy seguro para el consumo.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E162: {
        code: "E162",
        name: "Beetroot Red (Betanin)",
        nameTr: "Pancar Kırmızısı (Betanin)",
        nameEs: "Rojo Remolacha (Betanina)",
        risk: "SAFE",
        reason: "Beetroot Red is a natural pigment extracted from beets. It provides a vibrant red-purple color and contains betalains, which have antioxidant and anti-inflammatory properties. It's completely safe and may even offer health benefits. Common in ice cream, yogurt, and candies.",
        reasonTr:
            "Pancar Kırmızısı, pancardan elde edilen doğal bir pigmenttir. Canlı kırmızı-mor renk sağlar ve antioksidan ve anti-inflamatuar özelliklere sahip betalainler içerir. Tamamen güvenlidir ve hatta sağlık yararları bile sunabilir. Dondurma, yoğurt ve şekerlemelerde yaygındır.",
        reasonEs:
            "El Rojo Remolacha es un pigmento natural extraído de las remolachas. Proporciona un color rojo-púrpura vibrante y contiene betalaínas, que tienen propiedades antioxidantes y antiinflamatorias. Es completamente seguro e incluso puede ofrecer beneficios para la salud. Común en helados, yogures y dulces.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E163: {
        code: "E163",
        name: "Anthocyanins",
        nameTr: "Antosiyaninler",
        nameEs: "Antocianinas",
        risk: "SAFE",
        reason: "Anthocyanins are natural pigments that give berries, grapes, and red cabbage their vibrant colors. They are powerful antioxidants with numerous health benefits, including supporting heart health and cognitive function. They may help reduce inflammation and protect against certain diseases.",
        reasonTr:
            "Antosiyaninler, meyvelerine, üzümlere ve kırmızı lahanaya canlı renklerini veren doğal pigmentlerdir. Kalp sağlığını ve bilişsel işlevi desteklemek dahil çok sayıda sağlık yararı olan güçlü antioksidanlardır. İltihabı azaltmaya ve belirli hastalıklara karşı korumaya yardımcı olabilirler.",
        reasonEs:
            "Las Antocianinas son pigmentos naturales que dan a las bayas, uvas y repollo rojo sus colores vibrantes. Son antioxidantes poderosos con numerosos beneficios para la salud, incluyendo el apoyo a la salud cardíaca y la función cognitiva. Pueden ayudar a reducir la inflamación y proteger contra ciertas enfermedades.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E170: {
        code: "E170",
        name: "Calcium Carbonate",
        nameTr: "Kalsiyum Karbonat",
        nameEs: "Carbonato de Calcio",
        risk: "SAFE",
        reason: "Calcium Carbonate is simply chalk or limestone - a natural mineral. It's used as a white colorant and anti-caking agent. It also provides calcium, an essential mineral for bone health. It's so safe that it's commonly used as a dietary calcium supplement and antacid.",
        reasonTr:
            "Kalsiyum Karbonat, basitçe tebeşir veya kireçtaşıdır - doğal bir mineral. Beyaz renklendirici ve topaklanma önleyici olarak kullanılır. Ayrıca kemik sağlığı için temel bir mineral olan kalsiyum sağlar. O kadar güvenlidir ki, yaygın olarak diyet kalsiyum takviyesi ve antiasit olarak kullanılır.",
        reasonEs:
            "El Carbonato de Calcio es simplemente tiza o piedra caliza, un mineral natural. Se usa como colorante blanco y agente antiaglomerante. También proporciona calcio, un mineral esencial para la salud ósea. Es tan seguro que se usa comúnmente como suplemento dietético de calcio y antiácido.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "colorant",
        categoryTr: "Renklendirici",
        categoryEs: "Colorante",
    },
    E270: {
        code: "E270",
        name: "Lactic Acid",
        nameTr: "Laktik Asit",
        nameEs: "Ácido Láctico",
        risk: "SAFE",
        reason: "Lactic Acid is naturally produced during fermentation and is found in yogurt, sauerkraut, and sourdough bread. It's also produced by our muscles during exercise. As a food additive, it acts as a preservative and flavor enhancer. It's completely natural and safe for consumption.",
        reasonTr:
            "Laktik Asit, fermantasyon sırasında doğal olarak üretilir ve yoğurt, lahana turşusu ve ekşi maya ekmeğinde bulunur. Ayrıca egzersiz sırasında kaslarımız tarafından da üretilir. Gıda katkı maddesi olarak koruyucu ve lezzet arttırıcı görevi görür. Tamamen doğaldır ve tüketim için güvenlidir.",
        reasonEs:
            "El Ácido Láctico se produce naturalmente durante la fermentación y se encuentra en el yogur, la col fermentada y el pan de masa madre. También lo producen nuestros músculos durante el ejercicio. Como aditivo alimentario, actúa como conservante y potenciador del sabor. Es completamente natural y seguro para el consumo.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "preservative",
        categoryTr: "Koruyucu",
        categoryEs: "Conservante",
    },
    E290: {
        code: "E290",
        name: "Carbon Dioxide",
        nameTr: "Karbondioksit",
        nameEs: "Dióxido de Carbono",
        risk: "SAFE",
        reason: "Carbon Dioxide is the gas that makes beverages fizzy. It's a natural component of the air we exhale and is completely harmless in food applications. It's used to carbonate drinks, preserve food by creating an oxygen-free environment, and as a propellant in whipped cream cans.",
        reasonTr:
            "Karbondioksit, içecekleri gazlı yapan gazdır. Soluduğumuz havanın doğal bir bileşenidir ve gıda uygulamalarında tamamen zararsızdır. İçecekleri gazlandırmak, oksijensiz ortam oluşturarak gıdaları korumak ve krem şanti kutularında itici gaz olarak kullanılır.",
        reasonEs:
            "El Dióxido de Carbono es el gas que hace que las bebidas tengan burbujas. Es un componente natural del aire que exhalamos y es completamente inofensivo en aplicaciones alimentarias. Se usa para carbonatar bebidas, preservar alimentos creando un ambiente libre de oxígeno y como propelente en latas de crema batida.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "other",
        categoryTr: "Diğer",
        categoryEs: "Otro",
    },
    E296: {
        code: "E296",
        name: "Malic Acid",
        nameTr: "Malik Asit",
        nameEs: "Ácido Málico",
        risk: "SAFE",
        reason: "Malic Acid is the natural acid that gives apples their tart taste. It's found in many fruits and is produced naturally in our bodies during metabolism. As a food additive, it provides a sour flavor and helps preserve freshness. It's completely safe and natural.",
        reasonTr:
            "Malik Asit, elmalara ekşi tadını veren doğal asittir. Birçok meyvede bulunur ve metabolizma sırasında vücudumuzda doğal olarak üretilir. Gıda katkı maddesi olarak ekşi lezzet sağlar ve tazeliği korumaya yardımcı olur. Tamamen güvenli ve doğaldır.",
        reasonEs:
            "El Ácido Málico es el ácido natural que da a las manzanas su sabor agrio. Se encuentra en muchas frutas y se produce naturalmente en nuestros cuerpos durante el metabolismo. Como aditivo alimentario, proporciona un sabor ácido y ayuda a preservar la frescura. Es completamente seguro y natural.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E300: {
        code: "E300",
        name: "Ascorbic Acid (Vitamin C)",
        nameTr: "Askorbik Asit (C Vitamini)",
        nameEs: "Ácido Ascórbico (Vitamina C)",
        risk: "SAFE",
        reason: "Ascorbic Acid is simply vitamin C, an essential nutrient that our bodies cannot produce. It's a powerful antioxidant that supports immune function, skin health, and iron absorption. As a food additive, it prevents browning and acts as a preservative. It's not only safe but beneficial.",
        reasonTr:
            "Askorbik Asit, vücudumuzun üretemediği temel bir besin olan C vitaminidir. Bağışıklık fonksiyonunu, cilt sağlığını ve demir emilimini destekleyen güçlü bir antioksidandır. Gıda katkı maddesi olarak kararmaları önler ve koruyucu görevi görür. Sadece güvenli değil, aynı zamanda faydalıdır.",
        reasonEs:
            "El Ácido Ascórbico es simplemente vitamina C, un nutriente esencial que nuestros cuerpos no pueden producir. Es un poderoso antioxidante que apoya la función inmune, la salud de la piel y la absorción de hierro. Como aditivo alimentario, previene el oscurecimiento y actúa como conservante. No solo es seguro sino beneficioso.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "antioxidant",
        categoryTr: "Antioksidan",
        categoryEs: "Antioxidante",
    },
    E301: {
        code: "E301",
        name: "Sodium Ascorbate",
        nameTr: "Sodyum Askorbat",
        nameEs: "Ascorbato de Sodio",
        risk: "SAFE",
        reason: "Sodium Ascorbate is a mineral salt form of vitamin C. It's less acidic than ascorbic acid, making it gentler on the stomach. It provides the same antioxidant benefits as vitamin C and is commonly used in cured meats as a healthier alternative to nitrites.",
        reasonTr:
            "Sodyum Askorbat, C vitamininin mineral tuz formudur. Askorbik asitten daha az asidiktir, bu da mideye karşı daha yumuşak olmasını sağlar. C vitaminiyle aynı antioksidan faydaları sağlar ve kürlenmış etlerde nitritlere daha sağlıklı bir alternatif olarak yaygın şekilde kullanılır.",
        reasonEs:
            "El Ascorbato de Sodio es una forma de sal mineral de vitamina C. Es menos ácido que el ácido ascórbico, lo que lo hace más suave con el estómago. Proporciona los mismos beneficios antioxidantes que la vitamina C y se usa comúnmente en carnes curadas como una alternativa más saludable a los nitritos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "antioxidant",
        categoryTr: "Antioksidan",
        categoryEs: "Antioxidante",
    },
    E306: {
        code: "E306",
        name: "Tocopherols (Vitamin E)",
        nameTr: "Tokoferoller (E Vitamini)",
        nameEs: "Tocoferoles (Vitamina E)",
        risk: "SAFE",
        reason: "Tocopherols are the natural forms of vitamin E, an essential fat-soluble antioxidant. They protect cell membranes from damage and support immune function. As a food additive, they prevent fats from going rancid. Found naturally in nuts, seeds, and vegetable oils.",
        reasonTr:
            "Tokoferoller, temel yağda çözünür bir antioksidan olan E vitamininin doğal formlarıdır. Hücre zarlarını hasardan korur ve bağışıklık fonksiyonunu destekler. Gıda katkı maddesi olarak yağların acımasını önler. Doğal olarak kuruyemişlerde, tohumlarda ve bitkisel yağlarda bulunur.",
        reasonEs:
            "Los Tocoferoles son las formas naturales de vitamina E, un antioxidante esencial soluble en grasa. Protegen las membranas celulares del daño y apoyan la función inmune. Como aditivo alimentario, previenen que las grasas se vuelvan rancias. Se encuentran naturalmente en frutos secos, semillas y aceites vegetales.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "antioxidant",
        categoryTr: "Antioksidan",
        categoryEs: "Antioxidante",
    },
    E322: {
        code: "E322",
        name: "Lecithin",
        nameTr: "Lesitin",
        nameEs: "Lecitina",
        risk: "SAFE",
        reason: "Lecithin is a natural emulsifier found in egg yolks and soybeans. It helps oil and water mix together smoothly. It's an important component of cell membranes and supports brain function. Lecithin supplements are even taken for their potential cognitive and liver health benefits.",
        reasonTr:
            "Lesitin, yumurta sarısı ve soya fasulyesinde bulunan doğal bir emülgatördür. Yağ ve suyun düzgün bir şekilde karışmasına yardımcı olur. Hücre zarlarının önemli bir bileşenidir ve beyin fonksiyonunu destekler. Lesitin takviyeleri potansiyel bilişsel ve karaciğer sağlığı faydaları için bile alınmaktadır.",
        reasonEs:
            "La Lecitina es un emulgente natural que se encuentra en las yemas de huevo y la soja. Ayuda a que el aceite y el agua se mezclen suavemente. Es un componente importante de las membranas celulares y apoya la función cerebral. Incluso se toman suplementos de lecitina por sus potenciales beneficios cognitivos y para la salud hepática.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "emulsifier",
        categoryTr: "Emülgatör",
        categoryEs: "Emulgente",
    },
    E330: {
        code: "E330",
        name: "Citric Acid",
        nameTr: "Sitrik Asit",
        nameEs: "Ácido Cítrico",
        risk: "SAFE",
        reason: "Citric Acid is naturally found in citrus fruits and gives them their sour taste. It's also produced naturally in our bodies as part of energy metabolism. As a food additive, it provides tartness, acts as a preservative, and enhances flavors. It's one of the most common and safest food additives.",
        reasonTr:
            "Sitrik Asit, doğal olarak narenciye meyvelerinde bulunur ve onlara ekşi tadını verir. Ayrıca enerji metabolizmasının bir parçası olarak vücudumuzda doğal olarak üretilir. Gıda katkı maddesi olarak ekşilik sağlar, koruyucu görevi görür ve lezzetleri artırır. En yaygın ve en güvenli gıda katkı maddelerinden biridir.",
        reasonEs:
            "El Ácido Cítrico se encuentra naturalmente en los cítricos y les da su sabor agrio. También se produce naturalmente en nuestros cuerpos como parte del metabolismo energético. Como aditivo alimentario, proporciona acidez, actúa como conservante y realza los sabores. Es uno de los aditivos alimentarios más comunes y seguros.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E331: {
        code: "E331",
        name: "Sodium Citrate",
        nameTr: "Sodyum Sitrat",
        nameEs: "Citrato de Sodio",
        risk: "SAFE",
        reason: "Sodium Citrate is the sodium salt of citric acid. It's used as an acidity regulator and emulsifier. It helps create the smooth texture in processed cheese and ice cream. It's also used medically to treat kidney stones and urinary tract infections. Completely safe for consumption.",
        reasonTr:
            "Sodyum Sitrat, sitrik asidin sodyum tuzudur. Asitlik düzenleyici ve emülgatör olarak kullanılır. İşlenmiş peynir ve dondurmada pürüzsüz doku oluşturmaya yardımcı olur. Ayrıca tıbbi olarak böbrek taşları ve idrar yolu enfeksiyonlarını tedavi etmek için kullanılır. Tüketim için tamamen güvenlidir.",
        reasonEs:
            "El Citrato de Sodio es la sal sódica del ácido cítrico. Se usa como regulador de acidez y emulgente. Ayuda a crear la textura suave en el queso procesado y el helado. También se usa médicamente para tratar cálculos renales e infecciones del tracto urinario. Completamente seguro para el consumo.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E332: {
        code: "E332",
        name: "Potassium Citrate",
        nameTr: "Potasyum Sitrat",
        nameEs: "Citrato de Potasio",
        risk: "SAFE",
        reason: "Potassium Citrate provides both citrate (for acidity regulation) and potassium (an essential mineral). It's used in beverages and food products and is also a common dietary supplement. It can help prevent kidney stones and provides important electrolytes.",
        reasonTr:
            "Potasyum Sitrat, hem sitrat (asitlik düzenlemesi için) hem de potasyum (temel bir mineral) sağlar. İçeceklerde ve gıda ürünlerinde kullanılır ve ayrıca yaygın bir diyet takviyesidir. Böbrek taşlarını önlemeye yardımcı olabilir ve önemli elektrolitler sağlar.",
        reasonEs:
            "El Citrato de Potasio proporciona tanto citrato (para la regulación de acidez) como potasio (un mineral esencial). Se usa en bebidas y productos alimenticios y también es un suplemento dietético común. Puede ayudar a prevenir cálculos renales y proporciona electrolitos importantes.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E333: {
        code: "E333",
        name: "Calcium Citrate",
        nameTr: "Kalsiyum Sitrat",
        nameEs: "Citrato de Calcio",
        risk: "SAFE",
        reason: "Calcium Citrate is an excellent source of bioavailable calcium, better absorbed than calcium carbonate. It's used to fortify foods and beverages with calcium. It also acts as an acidity regulator. It's commonly used as a calcium supplement for bone health.",
        reasonTr:
            "Kalsiyum Sitrat, kalsiyum karbonattan daha iyi emilen, biyoyararlanılabilir kalsiyumun mükemmel bir kaynağıdır. Gıdaları ve içecekleri kalsiyumla zenginleştirmek için kullanılır. Ayrıca asitlik düzenleyici görevi görür. Kemik sağlığı için yaygın olarak kalsiyum takviyesi olarak kullanılır.",
        reasonEs:
            "El Citrato de Calcio es una excelente fuente de calcio biodisponible, mejor absorbido que el carbonato de calcio. Se usa para fortificar alimentos y bebidas con calcio. También actúa como regulador de acidez. Se usa comúnmente como suplemento de calcio para la salud ósea.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E334: {
        code: "E334",
        name: "Tartaric Acid",
        nameTr: "Tartarik Asit",
        nameEs: "Ácido Tartárico",
        risk: "SAFE",
        reason: "Tartaric Acid occurs naturally in grapes and is a byproduct of winemaking. It provides a distinctive tart taste and is essential in baking powder. It has antioxidant properties and is completely safe. It's one of the oldest known food acids, used for centuries.",
        reasonTr:
            "Tartarik Asit, doğal olarak üzümlerde bulunur ve şarap yapımının bir yan ürünüdür. Belirgin ekşi tat sağlar ve kabartma tozunda gereklidir. Antioksidan özelliklere sahiptir ve tamamen güvenlidir. Yüzyıllardır kullanılan en eski bilinen gıda asitlerinden biridir.",
        reasonEs:
            "El Ácido Tartárico ocurre naturalmente en las uvas y es un subproducto de la elaboración del vino. Proporciona un sabor agrio distintivo y es esencial en el polvo de hornear. Tiene propiedades antioxidantes y es completamente seguro. Es uno de los ácidos alimentarios más antiguos conocidos, usado durante siglos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E335: {
        code: "E335",
        name: "Sodium Tartrate",
        nameTr: "Sodyum Tartrat",
        nameEs: "Tartrato de Sodio",
        risk: "SAFE",
        reason: "Sodium Tartrate is the sodium salt of tartaric acid. It's used as an emulsifier and stabilizer in food products. It helps maintain texture and consistency. Like tartaric acid, it's derived from natural grape processing and is completely safe.",
        reasonTr:
            "Sodyum Tartrat, tartarik asidin sodyum tuzudur. Gıda ürünlerinde emülgatör ve stabilizatör olarak kullanılır. Doku ve kıvamı korumaya yardımcı olur. Tartarik asit gibi, doğal üzüm işlemesinden elde edilir ve tamamen güvenlidir.",
        reasonEs:
            "El Tartrato de Sodio es la sal sódica del ácido tartárico. Se usa como emulgente y estabilizador en productos alimenticios. Ayuda a mantener la textura y consistencia. Como el ácido tartárico, se deriva del procesamiento natural de uvas y es completamente seguro.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E336: {
        code: "E336",
        name: "Potassium Tartrate (Cream of Tartar)",
        nameTr: "Potasyum Tartrat (Krem Tartar)",
        nameEs: "Tartrato de Potasio (Crema de Tártaro)",
        risk: "SAFE",
        reason: "Potassium Tartrate, known as cream of tartar, is a natural byproduct of winemaking. It's essential in baking for stabilizing egg whites and creating fluffy textures. It's been used in cooking for centuries and provides a small amount of potassium. Completely natural and safe.",
        reasonTr:
            "Krem tartar olarak bilinen Potasyum Tartrat, şarap yapımının doğal bir yan ürünüdür. Yumurta aklarını stabilize etmek ve kabarık dokular oluşturmak için fırıncılıkta gereklidir. Yüzyıllardır yemek pişirmede kullanılmaktadır ve az miktarda potasyum sağlar. Tamamen doğal ve güvenlidir.",
        reasonEs:
            "El Tartrato de Potasio, conocido como crema de tártaro, es un subproducto natural de la elaboración del vino. Es esencial en la repostería para estabilizar claras de huevo y crear texturas esponjosas. Se ha usado en la cocina durante siglos y proporciona una pequeña cantidad de potasio. Completamente natural y seguro.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "acidity_regulator",
        categoryTr: "Asitlik Düzenleyici",
        categoryEs: "Regulador de acidez",
    },
    E392: {
        code: "E392",
        name: "Rosemary Extract",
        nameTr: "Biberiye Özütü",
        nameEs: "Extracto de Romero",
        risk: "SAFE",
        reason: "Rosemary Extract is a natural antioxidant derived from the rosemary herb. It's highly effective at preventing fats from going rancid and extending shelf life. It contains beneficial compounds like rosmarinic acid and carnosic acid. A natural alternative to synthetic antioxidants.",
        reasonTr:
            "Biberiye Özütü, biberiye bitkisinden elde edilen doğal bir antioksidandır. Yağların acımasını önlemede ve raf ömrünü uzatmada oldukça etkilidir. Rosmarinik asit ve karnosik asit gibi faydalı bileşikler içerir. Sentetik antioksidanlara doğal bir alternatiftir.",
        reasonEs:
            "El Extracto de Romero es un antioxidante natural derivado de la hierba romero. Es muy efectivo para prevenir que las grasas se vuelvan rancias y extender la vida útil. Contiene compuestos beneficiosos como el ácido rosmarínico y el ácido carnósico. Una alternativa natural a los antioxidantes sintéticos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "antioxidant",
        categoryTr: "Antioksidan",
        categoryEs: "Antioxidante",
    },
    E400: {
        code: "E400",
        name: "Alginic Acid",
        nameTr: "Aljinik Asit",
        nameEs: "Ácido Algínico",
        risk: "SAFE",
        reason: "Alginic Acid is extracted from brown seaweed. It's a natural thickener and gelling agent used in ice cream, desserts, and sauces. It's also used medically in heartburn remedies where it forms a protective barrier. High in fiber and completely safe.",
        reasonTr:
            "Aljinik Asit, kahverengi deniz yosunundan elde edilir. Dondurma, tatlılar ve soslarda kullanılan doğal bir kıvam arttırıcı ve jelleştirici ajandır. Ayrıca koruyucu bariyer oluşturduğu mide yanması ilaçlarında tıbbi olarak kullanılır. Lif açısından zengin ve tamamen güvenlidir.",
        reasonEs:
            "El Ácido Algínico se extrae de las algas marinas pardas. Es un espesante y agente gelificante natural usado en helados, postres y salsas. También se usa médicamente en remedios para la acidez donde forma una barrera protectora. Rico en fibra y completamente seguro.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E401: {
        code: "E401",
        name: "Sodium Alginate",
        nameTr: "Sodyum Aljinat",
        nameEs: "Alginato de Sodio",
        risk: "SAFE",
        reason: "Sodium Alginate is derived from seaweed and is famous for its use in molecular gastronomy to create 'caviar pearls' and other innovative textures. It's also used in traditional food production as a thickener. It's a source of dietary fiber and completely safe.",
        reasonTr:
            "Sodyum Aljinat, deniz yosunundan elde edilir ve moleküler gastronomide 'havyar incileri' ve diğer yenilikçi dokular oluşturmak için kullanımıyla ünlüdür. Ayrıca geleneksel gıda üretiminde kıvam arttırıcı olarak kullanılır. Diyet lifi kaynağıdır ve tamamen güvenlidir.",
        reasonEs:
            "El Alginato de Sodio se deriva del alga marina y es famoso por su uso en la gastronomía molecular para crear 'perlas de caviar' y otras texturas innovadoras. También se usa en la producción tradicional de alimentos como espesante. Es una fuente de fibra dietética y completamente seguro.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E406: {
        code: "E406",
        name: "Agar (Agar-Agar)",
        nameTr: "Agar (Agar-Agar)",
        nameEs: "Agar (Agar-Agar)",
        risk: "SAFE",
        reason: "Agar is a natural gelling agent derived from red seaweed. It's been used in Asian cuisine for centuries and is the perfect vegan alternative to gelatin. It sets at room temperature and provides dietary fiber. Also used in scientific laboratories for growing bacteria cultures.",
        reasonTr:
            "Agar, kırmızı deniz yosunundan elde edilen doğal bir jelleştirici ajandır. Asya mutfağında yüzyıllardır kullanılmaktadır ve jelatine mükemmel vegan alternatiftir. Oda sıcaklığında donar ve diyet lifi sağlar. Ayrıca bilimsel laboratuvarlarda bakteri kültürleri yetiştirmek için kullanılır.",
        reasonEs:
            "El Agar es un agente gelificante natural derivado de algas rojas. Se ha usado en la cocina asiática durante siglos y es la alternativa vegana perfecta a la gelatina. Cuaja a temperatura ambiente y proporciona fibra dietética. También se usa en laboratorios científicos para cultivar culturas bacterianas.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E410: {
        code: "E410",
        name: "Locust Bean Gum (Carob Gum)",
        nameTr: "Keçiboynuzu Gamı (Harnup Gamı)",
        nameEs: "Goma de Algarrobo (Goma de Garrofín)",
        risk: "SAFE",
        reason: "Locust Bean Gum is extracted from carob tree seeds. It's a natural thickener that creates smooth, creamy textures in ice cream and dairy products. It's high in fiber and may help regulate blood sugar. Used for thousands of years in Mediterranean cuisine.",
        reasonTr:
            "Keçiboynuzu Gamı, keçiboynuzu ağacı tohumlarından elde edilir. Dondurma ve süt ürünlerinde pürüzsüz, kremsi dokular oluşturan doğal bir kıvam arttırıcıdır. Lif açısından zengindir ve kan şekerini düzenlemeye yardımcı olabilir. Akdeniz mutfağında binlerce yıldır kullanılmaktadır.",
        reasonEs:
            "La Goma de Algarrobo se extrae de las semillas del algarrobo. Es un espesante natural que crea texturas suaves y cremosas en helados y productos lácteos. Es rica en fibra y puede ayudar a regular el azúcar en sangre. Usada durante miles de años en la cocina mediterránea.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E412: {
        code: "E412",
        name: "Guar Gum",
        nameTr: "Guar Gamı",
        nameEs: "Goma Guar",
        risk: "SAFE",
        reason: "Guar Gum is derived from guar beans and is one of the most effective natural thickeners. It can absorb many times its weight in water. It's a source of soluble fiber that may help lower cholesterol and blood sugar levels. Widely used in gluten-free baking.",
        reasonTr:
            "Guar Gamı, guar fasulyesinden elde edilir ve en etkili doğal kıvam arttırıcılardan biridir. Ağırlığının birçok katı suyu emebilir. Kolesterol ve kan şekeri seviyelerini düşürmeye yardımcı olabilecek çözünür lif kaynağıdır. Glutensiz fırıncılıkta yaygın olarak kullanılır.",
        reasonEs:
            "La Goma Guar se deriva de los frijoles guar y es uno de los espesantes naturales más efectivos. Puede absorber muchas veces su peso en agua. Es una fuente de fibra soluble que puede ayudar a reducir el colesterol y los niveles de azúcar en sangre. Ampliamente usada en la repostería sin gluten.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E414: {
        code: "E414",
        name: "Acacia Gum (Gum Arabic)",
        nameTr: "Akasya Gamı (Arap Gamı)",
        nameEs: "Goma de Acacia (Goma Arábiga)",
        risk: "SAFE",
        reason: "Acacia Gum is harvested from acacia trees and has been used for thousands of years. It's a natural emulsifier and stabilizer used in soft drinks, candies, and many other products. It's a prebiotic fiber that supports beneficial gut bacteria. Completely safe and natural.",
        reasonTr:
            "Akasya Gamı, akasya ağaçlarından hasat edilir ve binlerce yıldır kullanılmaktadır. Meşrubatlarda, şekerlemelerde ve diğer birçok üründe kullanılan doğal bir emülgatör ve stabilizatördür. Faydalı bağırsak bakterilerini destekleyen prebiyotik bir liftir. Tamamen güvenli ve doğaldır.",
        reasonEs:
            "La Goma de Acacia se cosecha de árboles de acacia y se ha usado durante miles de años. Es un emulgente y estabilizante natural usado en refrescos, dulces y muchos otros productos. Es una fibra prebiótica que apoya las bacterias intestinales beneficiosas. Completamente segura y natural.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E415: {
        code: "E415",
        name: "Xanthan Gum",
        nameTr: "Ksantan Gamı",
        nameEs: "Goma Xantana",
        risk: "SAFE",
        reason: "Xanthan Gum is produced through fermentation of sugars. It's an incredibly effective thickener used in everything from salad dressings to gluten-free bread. It provides structure to baked goods without gluten. It's well-studied and considered very safe at typical consumption levels.",
        reasonTr:
            "Ksantan Gamı, şekerlerin fermantasyonu yoluyla üretilir. Salata soslarından glutensiz ekmeğe kadar her şeyde kullanılan inanılmaz etkili bir kıvam arttırıcıdır. Glutensiz unlu mamullere yapı sağlar. İyi araştırılmıştır ve tipik tüketim seviyelerinde çok güvenli kabul edilir.",
        reasonEs:
            "La Goma Xantana se produce mediante la fermentación de azúcares. Es un espesante increíblemente efectivo usado en todo, desde aderezos para ensaladas hasta pan sin gluten. Proporciona estructura a productos horneados sin gluten. Está bien estudiada y se considera muy segura a niveles típicos de consumo.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E440: {
        code: "E440",
        name: "Pectin",
        nameTr: "Pektin",
        nameEs: "Pectina",
        risk: "SAFE",
        reason: "Pectin is a natural fiber found in fruits, especially apples and citrus peels. It's what makes jams and jellies set. It's a soluble fiber that may help lower cholesterol and regulate blood sugar. It's completely natural and provides health benefits beyond its functional use.",
        reasonTr:
            "Pektin, meyvelerde, özellikle elma ve narenciye kabuklarında bulunan doğal bir liftir. Reçellerin ve jölelerin katılaşmasını sağlayan maddedir. Kolesterolü düşürmeye ve kan şekerini düzenlemeye yardımcı olabilecek çözünür bir liftir. Tamamen doğaldır ve fonksiyonel kullanımının ötesinde sağlık yararları sağlar.",
        reasonEs:
            "La Pectina es una fibra natural que se encuentra en las frutas, especialmente en manzanas y cáscaras de cítricos. Es lo que hace que las mermeladas y jaleas cuajen. Es una fibra soluble que puede ayudar a reducir el colesterol y regular el azúcar en sangre. Es completamente natural y proporciona beneficios para la salud más allá de su uso funcional.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E460: {
        code: "E460",
        name: "Cellulose",
        nameTr: "Selüloz",
        nameEs: "Celulosa",
        risk: "SAFE",
        reason: "Cellulose is the main structural component of plant cell walls. It's indigestible fiber that aids digestion and helps you feel full. As a food additive, it prevents caking and adds texture. It's found naturally in all vegetables and fruits. Completely safe and beneficial.",
        reasonTr:
            "Selüloz, bitki hücre duvarlarının ana yapısal bileşenidir. Sindirimi kolaylaştıran ve tokluk hissi veren sindirilemez liftir. Gıda katkı maddesi olarak topaklanmayı önler ve doku katar. Doğal olarak tüm sebze ve meyvelerde bulunur. Tamamen güvenli ve faydalıdır.",
        reasonEs:
            "La Celulosa es el componente estructural principal de las paredes celulares de las plantas. Es fibra indigestible que ayuda a la digestión y te hace sentir lleno. Como aditivo alimentario, previene la aglomeración y añade textura. Se encuentra naturalmente en todas las verduras y frutas. Completamente segura y beneficiosa.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "thickener",
        categoryTr: "Kıvam Arttırıcı",
        categoryEs: "Espesante",
    },
    E500: {
        code: "E500",
        name: "Sodium Bicarbonate (Baking Soda)",
        nameTr: "Sodyum Bikarbonat (Karbonat)",
        nameEs: "Bicarbonato de Sodio (Bicarbonato)",
        risk: "SAFE",
        reason: "Sodium Bicarbonate, or baking soda, is a leavening agent that's been used in cooking for centuries. It reacts with acids to produce carbon dioxide, making baked goods rise. It's also used as an antacid and cleaning agent. One of the safest and most versatile additives.",
        reasonTr:
            "Karbonat veya kabartma tozu, yüzyıllardır yemek pişirmede kullanılan bir kabartma ajanıdır. Asitlerle reaksiyona girerek karbondioksit üretir ve unlu mamullerin kabarmasını sağlar. Ayrıca antiasit ve temizlik maddesi olarak kullanılır. En güvenli ve çok yönlü katkı maddelerinden biridir.",
        reasonEs:
            "El Bicarbonato de Sodio, o bicarbonato, es un agente leudante que se ha usado en la cocina durante siglos. Reacciona con ácidos para producir dióxido de carbono, haciendo que los productos horneados suban. También se usa como antiácido y agente de limpieza. Uno de los aditivos más seguros y versátiles.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "raising_agent",
        categoryTr: "Kabartıcı",
        categoryEs: "Gasificante",
    },
    E501: {
        code: "E501",
        name: "Potassium Carbonate",
        nameTr: "Potasyum Karbonat",
        nameEs: "Carbonato de Potasio",
        risk: "SAFE",
        reason: "Potassium Carbonate is a traditional leavening agent used especially in Asian cooking for noodles and mooncakes. It helps create unique textures in baked goods. It provides potassium, an essential mineral. It's been used safely in food for centuries.",
        reasonTr:
            "Potasyum Karbonat, özellikle Asya mutfağında erişte ve ay keki için kullanılan geleneksel bir kabartma ajanıdır. Unlu mamullerde benzersiz dokular oluşturmaya yardımcı olur. Temel bir mineral olan potasyum sağlar. Yüzyıllardır gıdalarda güvenle kullanılmaktadır.",
        reasonEs:
            "El Carbonato de Potasio es un agente leudante tradicional usado especialmente en la cocina asiática para fideos y pasteles de luna. Ayuda a crear texturas únicas en productos horneados. Proporciona potasio, un mineral esencial. Se ha usado de manera segura en alimentos durante siglos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "raising_agent",
        categoryTr: "Kabartıcı",
        categoryEs: "Gasificante",
    },
    E503: {
        code: "E503",
        name: "Ammonium Carbonate",
        nameTr: "Amonyum Karbonat",
        nameEs: "Carbonato de Amonio",
        risk: "SAFE",
        reason: "Ammonium Carbonate is a traditional leavening agent also known as 'baker's ammonia.' It's been used since the 13th century and produces very crisp textures in cookies and crackers. The ammonia completely evaporates during baking, leaving no residue.",
        reasonTr:
            "Amonyum Karbonat, 'fırıncı amonyağı' olarak da bilinen geleneksel bir kabartma ajanıdır. 13. yüzyıldan beri kullanılmaktadır ve kurabiye ve krakerlerde çok kıtır dokular üretir. Amonyak pişirme sırasında tamamen buharlaşır ve kalıntı bırakmaz.",
        reasonEs:
            "El Carbonato de Amonio es un agente leudante tradicional también conocido como 'amoníaco de panadero'. Se ha usado desde el siglo XIII y produce texturas muy crujientes en galletas y crackers. El amoníaco se evapora completamente durante el horneado, sin dejar residuos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "raising_agent",
        categoryTr: "Kabartıcı",
        categoryEs: "Gasificante",
    },
    E509: {
        code: "E509",
        name: "Calcium Chloride",
        nameTr: "Kalsiyum Klorür",
        nameEs: "Cloruro de Calcio",
        risk: "SAFE",
        reason: "Calcium Chloride is used to maintain firmness in canned vegetables and fruits. It's also essential in cheese making and helps tofu set properly. It provides calcium, an important mineral. It's a natural compound found in seawater and mineral deposits.",
        reasonTr:
            "Kalsiyum Klorür, konserve sebze ve meyvelerde sertliği korumak için kullanılır. Ayrıca peynir yapımında gereklidir ve tofunun düzgün katılaşmasına yardımcı olur. Önemli bir mineral olan kalsiyum sağlar. Deniz suyunda ve mineral yataklarında bulunan doğal bir bileşiktir.",
        reasonEs:
            "El Cloruro de Calcio se usa para mantener la firmeza en vegetales y frutas enlatadas. También es esencial en la elaboración de queso y ayuda a que el tofu cuaje correctamente. Proporciona calcio, un mineral importante. Es un compuesto natural que se encuentra en el agua de mar y depósitos minerales.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "other",
        categoryTr: "Diğer",
        categoryEs: "Otro",
    },
    E516: {
        code: "E516",
        name: "Calcium Sulfate (Gypsum)",
        nameTr: "Kalsiyum Sülfat (Alçı)",
        nameEs: "Sulfato de Calcio (Yeso)",
        risk: "SAFE",
        reason: "Calcium Sulfate is a natural mineral used for thousands of years in tofu production. It's also used as a flour treatment and dough conditioner. It provides calcium and is completely inert in the body. It's the same mineral used to make plaster of Paris.",
        reasonTr:
            "Kalsiyum Sülfat, binlerce yıldır tofu üretiminde kullanılan doğal bir mineraldir. Ayrıca un işleme ve hamur düzenleyici olarak kullanılır. Kalsiyum sağlar ve vücutta tamamen inerttir. Alçı yapımında kullanılan aynı mineraldir.",
        reasonEs:
            "El Sulfato de Calcio es un mineral natural usado durante miles de años en la producción de tofu. También se usa como tratamiento de harina acondicionador de masa. Proporciona calcio y es completamente inerte en el cuerpo. Es el mismo mineral usado para hacer yeso de París.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "other",
        categoryTr: "Diğer",
        categoryEs: "Otro",
    },
    E903: {
        code: "E903",
        name: "Carnauba Wax",
        nameTr: "Karnauba Mumu",
        nameEs: "Cera de Carnauba",
        risk: "SAFE",
        reason: "Carnauba Wax is a natural wax from Brazilian palm leaves. It's the hardest natural wax and is used to give a shiny coating to candies, fruits, and pills. It passes through the body undigested and is completely safe. Also used in car polish and cosmetics.",
        reasonTr:
            "Karnauba Mumu, Brezilya palmiye yapraklarından elde edilen doğal bir mumdur. En sert doğal mumdur ve şekerlemelere, meyvelere ve hapları parlak kaplama vermek için kullanılır. Vücuttan sindirilmeden geçer ve tamamen güvenlidir. Ayrıca araba cilası ve kozmetikte kullanılır.",
        reasonEs:
            "La Cera de Carnauba es una cera natural de las hojas de palma brasileñas. Es la cera natural más dura y se usa para dar un recubrimiento brillante a dulces, frutas y píldoras. Pasa a través del cuerpo sin digerirse y es completamente segura. También se usa en pulimento de autos y cosméticos.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "glazing_agent",
        categoryTr: "Parlatıcı",
        categoryEs: "Agente de brillo",
    },
    E901: {
        code: "E901",
        name: "Beeswax",
        nameTr: "Balmumu",
        nameEs: "Cera de Abeja",
        risk: "SAFE",
        reason: "Beeswax is a natural wax produced by honey bees. It's been used for thousands of years in food, cosmetics, and candles. It provides a protective coating and shiny appearance to candies and fruits. Note: Not suitable for strict vegans as it's an animal product.",
        reasonTr:
            "Balmumu, bal arıları tarafından üretilen doğal bir mumdur. Binlerce yıldır gıda, kozmetik ve mumlarda kullanılmaktadır. Şekerleme ve meyvelere koruyucu kaplama ve parlak görünüm sağlar. Not: Hayvansal ürün olduğu için katı veganlar için uygun değildir.",
        reasonEs:
            "La Cera de Abeja es una cera natural producida por las abejas melíferas. Se ha usado durante miles de años en alimentos, cosméticos y velas. Proporciona un recubrimiento protector y apariencia brillante a dulces y frutas. Nota: No es adecuada para veganos estrictos ya que es un producto animal.",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
        category: "glazing_agent",
        categoryTr: "Parlatıcı",
        categoryEs: "Agente de brillo",
    },
};

// NOVA Grupları

export type NovaGroup = 1 | 2 | 3 | 4;

export interface NovaInfo {
    group: NovaGroup;
    label: string;
    labelTr: string;
    labelEs: string;
    description: string;
    descriptionTr: string;
    descriptionEs: string;
    color: string;
    icon: string;
    examples: string[];
    examplesTr: string[];
    examplesEs: string[];
    healthTips: string[];
    healthTipsTr: string[];
    healthTipsEs: string[];
}

export const NOVA_GROUPS: Record<NovaGroup, NovaInfo> = {
    1: {
        group: 1,
        label: "Unprocessed or Minimally Processed",
        labelTr: "İşlenmemiş veya Az İşlenmiş",
        labelEs: "No Procesados o Mínimamente Procesados",
        description:
            "Fresh, whole foods that have been altered only by removal of inedible parts, drying, crushing, grinding, filtering, roasting, boiling, pasteurization, refrigeration, freezing, or fermentation. No added salt, sugar, oils, or other substances.",
        descriptionTr:
            "Yalnızca yenmeyen kısımların çıkarılması, kurutma, ezme, öğütme, filtreleme, kavurma, haşlama, pastörizasyon, soğutma, dondurma veya fermantasyon ile değiştirilmiş taze, bütün gıdalar. Tuz, şeker, yağ veya diğer maddeler eklenmemiştir.",
        descriptionEs:
            "Alimentos frescos y enteros que han sido alterados solo por la eliminación de partes no comestibles, secado, trituración, molienda, filtrado, tostado, hervido, pasteurización, refrigeración, congelación o fermentación. Sin sal, azúcar, aceites u otras sustancias añadidas.",
        color: "#22C55E",
        icon: "leaf",
        examples: ["Fresh fruits and vegetables", "Eggs", "Fresh meat and fish", "Milk", "Plain nuts and seeds", "Legumes", "Fresh herbs", "Water"],
        examplesTr: ["Taze meyve ve sebzeler", "Yumurta", "Taze et ve balık", "Süt", "Sade kuruyemiş ve tohumlar", "Baklagiller", "Taze otlar", "Su"],
        examplesEs: ["Frutas y verduras frescas", "Huevos", "Carne y pescado fresco", "Leche", "Frutos secos y semillas naturales", "Legumbres", "Hierbas frescas", "Agua"],
        healthTips: [
            "These foods should form the basis of your diet",
            "Rich in natural nutrients and fiber",
            "No artificial additives",
            "Support overall health and disease prevention",
        ],
        healthTipsTr: [
            "Bu gıdalar diyetinizin temelini oluşturmalıdır",
            "Doğal besin maddeleri ve lif açısından zengin",
            "Yapay katkı maddesi yok",
            "Genel sağlığı ve hastalık önlemeyi destekler",
        ],
        healthTipsEs: [
            "Estos alimentos deben formar la base de su dieta",
            "Ricos en nutrientes naturales y fibra",
            "Sin aditivos artificiales",
            "Apoyan la salud general y la prevención de enfermedades",
        ],
    },
    2: {
        group: 2,
        label: "Processed Culinary Ingredients",
        labelTr: "İşlenmiş Mutfak Malzemeleri",
        labelEs: "Ingredientes Culinarios Procesados",
        description:
            "Substances obtained from Group 1 foods or from nature by processes like pressing, refining, grinding, or milling. Used in home cooking to prepare, season, and cook Group 1 foods. Rarely consumed alone.",
        descriptionTr:
            "Presleme, rafine etme, öğütme veya değirmencilik gibi işlemlerle Grup 1 gıdalarından veya doğadan elde edilen maddeler. Grup 1 gıdaları hazırlamak, tatlandırmak ve pişirmek için ev yemeklerinde kullanılır. Nadiren tek başına tüketilir.",
        descriptionEs:
            "Sustancias obtenidas de alimentos del Grupo 1 o de la naturaleza mediante procesos como prensado, refinado, molienda o trituración. Se utilizan en la cocina casera para preparar, sazonar y cocinar alimentos del Grupo 1. Raramente se consumen solos.",
        color: "#84CC16",
        icon: "nutrition",
        examples: ["Olive oil and other vegetable oils", "Butter", "Sugar and honey", "Salt", "Flour", "Pasta (plain)", "Vinegar", "Cream"],
        examplesTr: ["Zeytinyağı ve diğer bitkisel yağlar", "Tereyağı", "Şeker ve bal", "Tuz", "Un", "Makarna (sade)", "Sirke", "Krema"],
        examplesEs: ["Aceite de oliva y otros aceites vegetales", "Mantequilla", "Azúcar y miel", "Sal", "Harina", "Pasta (sola)", "Vinagre", "Crema"],
        healthTips: [
            "Use in moderation to enhance Group 1 foods",
            "Choose high-quality versions when possible",
            "Extra virgin olive oil over refined oils",
            "These are cooking tools, not main foods",
        ],
        healthTipsTr: [
            "Grup 1 gıdaları geliştirmek için ölçülü kullanın",
            "Mümkün olduğunda yüksek kaliteli versiyonları tercih edin",
            "Rafine yağlar yerine sızma zeytinyağı",
            "Bunlar ana gıdalar değil, pişirme araçlarıdır",
        ],
        healthTipsEs: [
            "Usar con moderación para realzar los alimentos del Grupo 1",
            "Elija versiones de alta calidad cuando sea posible",
            "Aceite de oliva virgen extra en lugar de aceites refinados",
            "Estas son herramientas de cocina, no alimentos principales",
        ],
    },
    3: {
        group: 3,
        label: "Processed Foods",
        labelTr: "İşlenmiş Gıdalar",
        labelEs: "Alimentos Procesados",
        description:
            "Products made by adding Group 2 ingredients to Group 1 foods using preservation methods like canning, bottling, or non-alcoholic fermentation. Usually made with few ingredients and recognizable as modified versions of the original foods.",
        descriptionTr:
            "Konserveleme, şişeleme veya alkolsüz fermantasyon gibi koruma yöntemleri kullanılarak Grup 1 gıdalarına Grup 2 malzemeleri eklenerek yapılan ürünler. Genellikle az malzeme ile yapılır ve orijinal gıdaların değiştirilmiş versiyonları olarak tanınabilir.",
        descriptionEs:
            "Productos elaborados añadiendo ingredientes del Grupo 2 a alimentos del Grupo 1 usando métodos de conservación como enlatado, embotellado o fermentación no alcohólica. Generalmente hechos con pocos ingredientes y reconocibles como versiones modificadas de los alimentos originales.",
        color: "#EAB308",
        icon: "cube",
        examples: [
            "Canned vegetables and legumes",
            "Canned fish",
            "Cheese",
            "Freshly made bread",
            "Salted or cured meats",
            "Fruits in syrup",
            "Pickles",
        ],
        examplesTr: [
            "Konserve sebzeler ve baklagiller",
            "Konserve balık",
            "Peynir",
            "Taze yapılmış ekmek",
            "Tuzlanmış veya kürlenmiş etler",
            "Şuruplu meyveler",
            "Turşular",
        ],
        examplesEs: [
            "Verduras y legumbres enlatadas",
            "Pescado enlatado",
            "Queso",
            "Pan recién hecho",
            "Carnes saladas o curadas",
            "Frutas en almíbar",
            "Encurtidos",
        ],
        healthTips: [
            "Can be part of a healthy diet in moderation",
            "Watch sodium content in canned goods",
            "Check labels for added sugars",
            "Choose versions with fewer additives",
        ],
        healthTipsTr: [
            "Ölçülü tüketildiğinde sağlıklı diyetin parçası olabilir",
            "Konservelerde sodyum içeriğine dikkat edin",
            "Eklenen şekerler için etiketleri kontrol edin",
            "Daha az katkı maddesi içeren versiyonları tercih edin",
        ],
        healthTipsEs: [
            "Pueden ser parte de una dieta saludable con moderación",
            "Observe el contenido de sodio en productos enlatados",
            "Revise las etiquetas para azúcares añadidos",
            "Elija versiones con menos aditivos",
        ],
    },
    4: {
        group: 4,
        label: "Ultra-Processed Foods",
        labelTr: "Aşırı İşlenmiş Gıdalar",
        labelEs: "Alimentos Ultraprocesados",
        description:
            "Industrial formulations made mostly or entirely from substances derived from foods and additives, with little or no intact Group 1 foods. Often contain ingredients not used in home cooking like high-fructose corn syrup, hydrogenated oils, protein isolates, and many additives.",
        descriptionTr:
            "Çoğunlukla veya tamamen gıdalardan elde edilen maddelerden ve katkı maddelerinden yapılan, çok az veya hiç bozulmamış Grup 1 gıda içermeyen endüstriyel formülasyonlar. Genellikle yüksek fruktozlu mısır şurubu, hidrojenize yağlar, protein izolatları ve birçok katkı maddesi gibi ev yemeklerinde kullanılmayan içerikler içerir.",
        descriptionEs:
            "Formulaciones industriales hechas mayormente o enteramente de sustancias derivadas de alimentos y aditivos, con pocos o ningún alimento del Grupo 1 intacto. A menudo contienen ingredientes no usados en la cocina casera como jarabe de maíz alto en fructosa, aceites hidrogenados, aislados de proteína y muchos aditivos.",
        color: "#DC2626",
        icon: "warning",
        examples: [
            "Soft drinks and energy drinks",
            "Packaged snacks (chips, cookies)",
            "Instant noodles",
            "Processed meats (hot dogs, nuggets)",
            "Ice cream (most brands)",
            "Breakfast cereals",
            "Fast food",
            "Margarine",
        ],
        examplesTr: [
            "Meşrubatlar ve enerji içecekleri",
            "Paketli atıştırmalıklar (cips, kurabiye)",
            "Hazır erişte",
            "İşlenmiş etler (sosisli, nugget)",
            "Dondurma (çoğu marka)",
            "Kahvaltılık gevrekler",
            "Fast food",
            "Margarin",
        ],
        examplesEs: [
            "Refrescos y bebidas energéticas",
            "Snacks empaquetados (papas fritas, galletas)",
            "Fideos instantáneos",
            "Carnes procesadas (hot dogs, nuggets)",
            "Helado (la mayoría de marcas)",
            "Cereales para el desayuno",
            "Comida rápida",
            "Margarina",
        ],
        healthTips: [
            "Limit consumption as much as possible",
            "Associated with obesity, diabetes, and heart disease",
            "Often high in sugar, salt, and unhealthy fats",
            "Designed to be hyper-palatable and addictive",
            "Replace with Group 1-3 alternatives when possible",
        ],
        healthTipsTr: [
            "Tüketimi mümkün olduğunca sınırlayın",
            "Obezite, diyabet ve kalp hastalığı ile ilişkili",
            "Genellikle şeker, tuz ve sağlıksız yağlar açısından yüksek",
            "Aşırı lezzetli ve bağımlılık yapıcı olacak şekilde tasarlanmış",
            "Mümkün olduğunda Grup 1-3 alternatifleriyle değiştirin",
        ],
        healthTipsEs: [
            "Limite el consumo tanto como sea posible",
            "Asociados con obesidad, diabetes y enfermedades cardíacas",
            "A menudo altos en azúcar, sal y grasas poco saludables",
            "Diseñados para ser hiper-palatables y adictivos",
            "Reemplace con alternativas del Grupo 1-3 cuando sea posible",
        ],
    },
};

// Nutri-Score Verileri

export type NutriScore = "A" | "B" | "C" | "D" | "E";

export interface NutriScoreInfo {
    score: NutriScore;
    label: string;
    labelTr: string;
    labelEs: string;
    description: string;
    descriptionTr: string;
    descriptionEs: string;
    color: string;
    examples: string[];
    examplesTr: string[];
    examplesEs: string[];
}

export const NUTRI_SCORES: Record<NutriScore, NutriScoreInfo> = {
    A: {
        score: "A",
        label: "Excellent Nutritional Quality",
        labelTr: "Çok İyi Besin Değeri",
        labelEs: "Calidad Nutricional Excelente",
        description:
            "Foods with the highest nutritional value. Low in sugar, salt, and saturated fat. Rich in fiber, protein, fruits, and vegetables.",
        descriptionTr:
            "En yüksek besin değerine sahip gıdalar. Şeker, tuz ve doymuş yağ oranı düşüktür. Lif, protein, meyve ve sebze açısından zengindir.",
        descriptionEs:
            "Alimentos con el mayor valor nutricional. Bajos en azúcar, sal y grasas saturadas. Ricos en fibra, proteínas, frutas y verduras.",
        color: "#00813D",
        examples: ["Water", "Fresh fruits", "Vegetables", "Legumes", "Whole grains"],
        examplesTr: ["Su", "Taze meyveler", "Sebzeler", "Baklagiller", "Tam tahıllar"],
        examplesEs: ["Agua", "Frutas frescas", "Verduras", "Legumbres", "Granos integrales"],
    },
    B: {
        score: "B",
        label: "Good Nutritional Quality",
        labelTr: "İyi Besin Değeri",
        labelEs: "Buena Calidad Nutricional",
        description: "Healthy foods that form a balanced diet. Slightly higher in calories or fat than Group A but still very beneficial.",
        descriptionTr:
            "Dengeli bir diyet oluşturan sağlıklı gıdalar. A grubuna göre kalori veya yağ oranı biraz daha yüksektir ancak yine de çok faydalıdır.",
        descriptionEs:
            "Alimentos saludables que forman una dieta equilibrada. Ligeramente más altos en calorías o grasa que el Grupo A pero aún muy beneficiosos.",
        color: "#85BB2F",
        examples: ["Olive oil", "Nuts", "Yogurt", "Milk", "Eggs"],
        examplesTr: ["Zeytinyağı", "Kuruyemişler", "Yoğurt", "Süt", "Yumurta"],
        examplesEs: ["Aceite de oliva", "Frutos secos", "Yogur", "Leche", "Huevos"],
    },
    C: {
        score: "C",
        label: "Average Nutritional Quality",
        labelTr: "Ortalama Besin Değeri",
        labelEs: "Calidad Nutricional Media",
        description:
            "Foods that should be consumed in moderation. Balanced mix of nutrients but may contain moderate amounts of salt, sugar, or fat.",
        descriptionTr: "Ölçülü tüketilmesi gereken gıdalar. Dengeli besin karışımı sunar ancak orta miktarda tuz, şeker veya yağ içerebilir.",
        descriptionEs:
            "Alimentos que deben consumirse con moderación. Mezcla equilibrada de nutrientes pero pueden contener cantidades moderadas de sal, azúcar o grasa.",
        color: "#FECB02",
        examples: ["Canned fish", "Cheese", "Flavored yogurt", "Instant oatmeal"],
        examplesTr: ["Konserve balık", "Peynir", "Aromalı yoğurt", "Hazır yulaf ezmesi"],
        examplesEs: ["Pescado enlatado", "Queso", "Yogur con sabor", "Avena instantánea"],
    },
    D: {
        score: "D",
        label: "Low Nutritional Quality",
        labelTr: "Düşük Besin Değeri",
        labelEs: "Baja Calidad Nutricional",
        description: "Foods with lower nutritional density. Often processed and higher in sugar, salt, or saturated fats.",
        descriptionTr: "Besin yoğunluğu daha düşük gıdalar. Genellikle işlenmiştir ve şeker, tuz veya doymuş yağ oranı yüksektir.",
        descriptionEs:
            "Alimentos con menor densidad nutricional. A menudo procesados y altos en azúcar, sal o grasas saturadas.",
        color: "#EE8100",
        examples: ["Cream desserts", "Salty snacks", "Jam", "Butter"],
        examplesTr: ["Kremalı tatlılar", "Tuzlu atıştırmalıklar", "Reçel", "Tereyağı"],
        examplesEs: ["Postres con crema", "Snacks salados", "Mermelada", "Mantequilla"],
    },
    E: {
        score: "E",
        label: "Poor Nutritional Quality",
        labelTr: "Kötü Besin Değeri",
        labelEs: "Pobre Calidad Nutricional",
        description: "Foods high in calories, sugar, salt, or saturated fat with little nutritional benefit. Should be consumed sparingly.",
        descriptionTr: "Kalori, şeker, tuz veya doymuş yağ oranı yüksek, besin değeri düşük gıdalar. Nadiren tüketilmelidir.",
        descriptionEs:
            "Alimentos altos en calorías, azúcar, sal o grasas saturadas con poco beneficio nutricional. Deben consumirse con moderación.",
        color: "#E63E11",
        examples: ["Sugary drinks", "Candy", "Cookies", "Chocolate bars", "Fried foods"],
        examplesTr: ["Şekerli içecekler", "Şekerleme", "Kurabiyeler", "Çikolata barları", "Kızartmalar"],
        examplesEs: ["Bebidas azucaradas", "Dulces", "Galletas", "Barras de chocolate", "Alimentos fritos"],
    },
};

// Helper Functions

export function getAdditiveInfo(code: string): AdditiveInfo | null {
    const normalized = code.toUpperCase().replace(/\s/g, "");
    return ADDITIVE_DATABASE[normalized] || null;
}

export function getAllAdditives(): AdditiveInfo[] {
    return Object.values(ADDITIVE_DATABASE);
}

export function getAdditivesByRisk(risk: AdditiveRisk): AdditiveInfo[] {
    return Object.values(ADDITIVE_DATABASE).filter((a) => a.risk === risk);
}

export function getAdditivesByCategory(category: AdditiveInfo["category"]): AdditiveInfo[] {
    return Object.values(ADDITIVE_DATABASE).filter((a) => a.category === category);
}

export function searchAdditives(query: string): AdditiveInfo[] {
    const q = query.toLowerCase();
    return Object.values(ADDITIVE_DATABASE).filter(
        (a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.nameTr.toLowerCase().includes(q) || a.nameEs.toLowerCase().includes(q)
    );
}

export function getNovaInfo(group: NovaGroup): NovaInfo {
    return NOVA_GROUPS[group];
}

export function getNutriScoreInfo(score: NutriScore): NutriScoreInfo {
    return NUTRI_SCORES[score];
}

export function getAllCategories(): { key: AdditiveInfo["category"]; label: string; labelTr: string; labelEs: string }[] {
    return [
        { key: "colorant", label: "Colorants", labelTr: "Renklendiriciler", labelEs: "Colorantes" },
        { key: "preservative", label: "Preservatives", labelTr: "Koruyucular", labelEs: "Conservantes" },
        { key: "antioxidant", label: "Antioxidants", labelTr: "Antioksidanlar", labelEs: "Antioxidantes" },
        { key: "sweetener", label: "Sweeteners", labelTr: "Tatlandırıcılar", labelEs: "Edulcorantes" },
        { key: "emulsifier", label: "Emulsifiers", labelTr: "Emülgatörler", labelEs: "Emulgentes" },
        { key: "thickener", label: "Thickeners", labelTr: "Kıvam Arttırıcılar", labelEs: "Espesantes" },
        { key: "acidity_regulator", label: "Acidity Regulators", labelTr: "Asitlik Düzenleyiciler", labelEs: "Reguladores de acidez" },
        { key: "flavor_enhancer", label: "Flavor Enhancers", labelTr: "Lezzet Arttırıcılar", labelEs: "Potenciadores del sabor" },
        { key: "raising_agent", label: "Raising Agents", labelTr: "Kabartıcılar", labelEs: "Gasificantes" },
        { key: "glazing_agent", label: "Glazing Agents", labelTr: "Parlatıcılar", labelEs: "Agentes de brillo" },
        { key: "other", label: "Other", labelTr: "Diğer", labelEs: "Otros" },
    ];
}
