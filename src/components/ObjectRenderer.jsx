import { getObjectComponent } from "./objects";

export default function ObjectRenderer({ obj }) {
  const Component = getObjectComponent(obj.type);

  if (!Component) {
    console.warn(`Unknown object type: "${obj.type}"`, obj);
    return null;
  }

  return <Component {...obj} />;
}
