// const imageRegistryArtifact = artifacts.require('./ImageRegistry.sol');

// contract("imageRegistry tests", async accounts => {
//   it ("compares between binary and uint encodings for static images", async() => {
//     let imageRegistry = await imageRegistryArtifact.deployed();
//     let binaryData = '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00@\x00\x00\x00@\x04\x03\x00\x00\x00XGl\xed\x00\x00\x00\x04gAMA\x00\x00\xb1\x8f\x0b\xfca\x05\x00\x00\x00 cHRM\x00\x00z&\x00\x00\x80\x84\x00\x00\xfa\x00\x00\x00\x80\xe8\x00\x00u0\x00\x00\xea`\x00\x00:\x98\x00\x00\x17p\x9c\xbaQ<\x00\x00\x000PLTE\x00\x00\x000\x01\x00o\x03\x00\x8e\x02\x00\xea\n\x00\xe6`\x06X\r\x06\xd8"\x03\x16$\x15\xa8U\x1e\xb1\x02\x01@D2\x9e\xa1v\xce\x9f<\xa5)\x06\xe9\xa1\x0e\x8e\x9f\xb3\xbc\x00\x00\x00\x01bKGD\x00\x88\x05\x1dH\x00\x00\x00\x07tIME\x07\xe5\x01\x0b\x15\x0c\x1a+\x06Y\xcd\x00\x00\x01\xf8IDAT\x18\x19\xed\xc1\xefK\x13q\x1c\x07\xf0\xf7mx\x0e\x16c9\x8a\xb2\x07]f\x81\xf6dP\xacz\xdcw\x8c\x0e\xeaA\xdeq\x19\xd5\xad\xa4\x03G\x0f\n7\x06B5\x08\xc2\xd8\x93`d\x8dt\xc2\xb4\x8d\xdd\x83\x18\xf5\xa4\x9a\x7f@?n\xd4\xa0\x1f\x14\xca(\xa9 Hhx\r1\xf9\x96\xf8\xc8\xf59\x1f\xf4\xd8\xd7\x0b\x1b\xfe\x8f\x1f\xeb\xea8\xd0\x87\xf5\x88\x11M\x81\xb3\x11\xb8\x12L\xb9\x04G\xdb\x0fuj\n\x8bK\xa0\xa5\x9eZ\x99\x83S\n\x0b+\x12H\xe9\x8boB\xc7\xb5Hb\xe1t\x1fH\x9b\xe6\n\xddG\x93I\xa6\x1ck\x80v\xde\x88=0\xe3J\xbc\xb8\x08\xda\xfe\xc9\xeeo\xb9\xdb\nc\xbc\x0c\x8a+o|/\x9d\xd2\x126\xe7K\xa0t\x19\xfbF+\xb9LXW\x7fWA\xe8\xc8\xf4\\\x10_\xa6\x1f\xde\xd7\x17\x96\xab\xa0\x94\xc6\xca\x9eg\xe9\xe7In\xdb\xefA\xb9\x81\x14\xa6{\xb3g\xf8\xab\xe6k8\xa9X\xe3WT\xcb\xdc\x06\'^1;3;~=\x08\'\x82\xd03Q\x1f\xbb\xd5\x0bG"\x9f\xa8\xdd,\xc7$P\x02M\t{>\xf5\x8f\xbe\xf0\xe7ARu\xcdx\xb4\xfb\xf0|\xed\x1ch6[\xfe\xd8(\x15\x02\\\x96@j\x86\xd9$v\x0c\x86~\xec\x05\xcd\xd8R,`\xc4\x9aN\x81\xb6\x19\xed\xc3\xd9z\xda\xaa \x87\xbf\xbc)\xb40$\xb7\xce\xdf\t3ww\x86\xb0\xa2\x8c\x16\x9e;.\xfe\x13\x82\xf5d\x11\xab\xd2XK\xd4\x07\xeb\r\xb4\xcdV\xb3X\xe5\xc1Z\xbe{\t~6o\xd7\xdf\xd6\xfc\x00\xbc\x8f\xcbh\x95\xfd\xa2\xaa\x9an\xf3\xfe\x13X\x11\xc5?\xda\xec\x88\xcd8\xd7/\xc3\x81\xcfV\xe2\xecZS\xfb\n\x07\xeeb\x9c\xc9\xaa\xac\xff\x92\x00\x11\x04\x1f\x93e32\xc5\xd4\x93\xa0\xb5\x0f\x0f\x98Gd\x93]]\x02-\xf69`F\x85\x00\x0b\x7f\x00I\xd0\x86:\xb7\x06\xe1\x1a\xca\xcf\xfbAq+\xb9\xae]\x03A\xcc\x85\xe0 \n\xc0\x1d\x84K\xc0\x86\rN\xfe\x00\xcef\xad\xb1qa\xa3\x00\x00\x00\x00%tEXtdate:create\x002021-01-11T21:12:26-08:00.\x033\xd8\x00\x00\x00%tEXtdate:modify\x002021-01-11T21:12:26-08:00_^\x8bd\x00\x00\x00\x00IEND\xaeB`\x82';

//     // console.log( web3.utils.fromAscii(binaryData));
//     // let encodedString = web3.utils.toAscii(tx.logs[0].args['0']);
//     // console.log(encodedString === binaryData);

//     console.log(web3.utils.fromAscii(binaryData).length);

//     let tx = await imageRegistry.saveBytes(
//       web3.utils.fromAscii(binaryData)
//     );

//     console.log(tx.receipt.gasUsed);
//     console.log("-----");
    
//     tx = await imageRegistry.saveUints([
//       web3.utils.toBN('182521206828400401493034671582069933138'),
//       web3.utils.toBN('5070602402093798301505311754092'),
//       web3.utils.toBN('315027035002387829655812384943984344161'),
//       web3.utils.toBN('6646139988948124863512141713073242240'),
//       web3.utils.toBN('175458115250649526167287534097931436266'),
//       web3.utils.toBN('127605892237627071551331187840625147904'),
//       web3.utils.toBN('64219875686008742515953612656182595074'),
//       web3.utils.toBN('1215200360290825277823796738279220245'),
//       web3.utils.toBN('223752271021134684006108486505928277157'),
//       web3.utils.toBN('54534240170009787166263306171302693703'),
//       web3.utils.toBN('90390262526283296499791583369570355173'),
//       web3.utils.toBN('1386770150667049889397923940319970369'),
//       web3.utils.toBN('111780292667872271061945378744317081614'),
//       web3.utils.toBN('29758220382194167552753337170579348599'),
//       web3.utils.toBN('186169362868427930510179309688395020038'),
//       web3.utils.toBN('88004417151874079875551901136994534168'),
//       web3.utils.toBN('326515529225043428599090522376091803720'),
//       web3.utils.toBN('138863054815404521940451519878617565979'),
//       web3.utils.toBN('338367056825943193026673793446991565240'),
//       web3.utils.toBN('24324471070304721681341101633867980378'),
//       web3.utils.toBN('204053758479295324470777695335712376930'),
//       web3.utils.toBN('299679239994569806403454241562067435638'),
//       web3.utils.toBN('295796008537293132718543984811228248539'),
//       web3.utils.toBN('13810131433348984988570384621099240352'),
//       web3.utils.toBN('154325351376827371743752498584794756188'),
//       web3.utils.toBN('21764285539152409336019666505356437481'),
//       web3.utils.toBN('307432953187058974909792475792400755686'),
//       web3.utils.toBN('142521598942723941350548232737440609083'),
//       web3.utils.toBN('167799622966929941925310861202805661608'),
//       web3.utils.toBN('293991887206728499957794738926383064897'),
//       web3.utils.toBN('109608361844171804535810851242459977768'),
//       web3.utils.toBN('27926050391044039647691356260004529613'),
//       web3.utils.toBN('287539915524713453694178604497390721706'),
//       web3.utils.toBN('43240144789055079214644398695105656710'),
//       web3.utils.toBN('234788120678562102345433709237385286232'),
//       web3.utils.toBN('100793027217605371798526726366920866569'),
//       web3.utils.toBN('167765379950056283945568443524404060842'),
//       web3.utils.toBN('205277212760789526022951094841123591983'),
//       web3.utils.toBN('259873470815448865378039134883650783658'),
//       web3.utils.toBN('229954212211000274311177887757083320501'),
//       web3.utils.toBN('20019392972237708048062487854429144320'),
//       web3.utils.toBN('15280935502859016628235908450401075569'),
//       web3.utils.toBN('58120915246078475903447381831791692736'),
//       web3.utils.toBN('178185653446491566786010558410952540160'),
//       web3.utils.toBN('49785148773994494460774253081665827941'),
//       web3.utils.toBN('260592375215237098690396240089266737'),
//       web3.utils.toBN('66763571419826891408649102387328843776'),
//       web3.utils.toBN('194473237398415993987399468999534950'),
//       web3.utils.toBN('160837605428940505141277413654234542394'),
//       web3.utils.toBN('65392966994319576566851581721923249152'),
//       web3.utils.toBN('5279712195050102914')
//     ]);
//     console.log(tx.receipt.gasUsed);
//   });
// });

// contract("imageRegistry tests", async accounts => {
//   it ("compares costs for bytes and uint", async() => {
//     let imageRegistry = await imageRegistryArtifact.deployed();

//     let lore = "A mystic scholar who may be from another world entirely. He is the only Ancient God left alive in the modern world. Many of his writings have mysteriously found their ways into libraries and studies across the world.";
    

//     // tricky encoding is way too wasteful
//     // just do it normally lmao
//     let encodedLore = lore.toLowerCase().split("");
//     encodedLore = encodedLore.map(function(c) {
//       let char = c.charCodeAt(0) - 97;
//       if (c == " ") {
//         char = 26;
//       }
//       if (c == ".") {
//         char = 27;
//       }
//       if (c == ",") {
//         char = 28;
//       }
//       if (c == "(") {
//         char = 29;
//       }
//       if (c == ")") {
//         char = 30;
//       }
//       if (c == "-") {
//         char = 31;
//       }
//       else if (char < 0 || char > 31) {
//         char = 0;
//       }
//       // convert to fixed 5 bits
//       char = ('00000'+char.toString(2)).slice(-5);
//       return char;
//     });
//     encodedLore = encodedLore.reduce((all,one,i) => {
//       const ch = Math.floor(i/51); 
//       all[ch] = ''.concat((all[ch]||[]),one); 
//       return all
//     }, []);
//     encodedLore = encodedLore.map((s) => {
//       return web3.utils.toBN(BigInt('0b' + s));
//     })

//     let tx = await imageRegistry.saveBytes(
//       web3.utils.fromAscii(lore)
//     );

//     console.log(tx.receipt.gasUsed);
//     console.log("-----");

//     tx = await imageRegistry.saveUints(encodedLore);
//     console.log(tx.receipt.gasUsed);
//   });
// });