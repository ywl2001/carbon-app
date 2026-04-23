type MetadataAttribute = {
    trait_type: string;
    value: string | number;
  };
  
  type Props = {
    attributes?: MetadataAttribute[];
  };
  
  export default function MetadataSnapshot({ attributes }: Props) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-500">Metadata</p>
          <h2 className="mt-1 text-2xl font-semibold">Attributes Snapshot</h2>
        </div>
  
        <div className="space-y-3">
          {attributes?.length ? (
            attributes.map((attr, index) => (
              <div
                key={`${attr.trait_type}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <p className="text-sm text-slate-500">{attr.trait_type}</p>
                <p className="font-medium text-slate-900">
                  {String(attr.value)}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No metadata available.
            </div>
          )}
        </div>
      </section>
    );
  }