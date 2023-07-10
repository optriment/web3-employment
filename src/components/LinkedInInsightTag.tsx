import Image from 'next/image'
import Script from 'next/script'
import React from 'react'

export const LinkedInInsightTag = ({ partnerId }: { partnerId: string }) => (
  <>
    <Script id="linkedin-vars">
      {`
        _linkedin_partner_id = "${partnerId}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      `}
    </Script>

    <Script id="linkedin-tracking-code">
      {`
        (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);})(window.lintrk);
      `}
    </Script>

    <noscript>
      <Image
        height="1"
        width="1"
        style={{ display: 'none' }}
        alt=""
        src={`https://px.ads.linkedin.com/collect/?pid=${partnerId}&fmt=gif`}
      />
    </noscript>
  </>
)
