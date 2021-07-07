const svgArtifact = artifacts.require('./SVGGenerator1.sol');

contract("SVG tests", async accounts => {
  it ("returns the right thing", async() => {
    let svg = await svgArtifact.deployed();
    let result = await svg.createSVG(24, 1);
    console.log(result);
  });
});