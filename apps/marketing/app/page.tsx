import Hero from "../components/home/Hero";
import ToolingStrip from "../components/home/ToolingStrip";
import CodeRulePanel from "../components/home/CodeRulePanel";
import FeatureCallouts from "../components/home/FeatureCallouts";
import ComparisonCards from "../components/home/ComparisonCards";

export default function Home() {
  return (
    <>
      <Hero />
      <ToolingStrip />
      <CodeRulePanel />
      <FeatureCallouts />
      <ComparisonCards />
    </>
  );
}
