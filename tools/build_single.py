"""Inline CSS + JS into one self-contained file: python3 tools/build_single.py dist/civic-track.html"""
import sys,os
r=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p:open(os.path.join(r,p),encoding='utf-8').read()
h=rd('index.html')
import re
h=re.sub(r'<link[^>]*leaflet[^>]*>\n','',h);h=re.sub(r'<script src="[^"]*leaflet[^"]*"></script>\n','',h)  # tiles/CSS blocked in claude.ai preview: SVG fallback.replace('<link rel="stylesheet" href="src/styles.css">','<style>\n'+rd('src/styles.css')+'</style>')
h=h.replace('<script src="src/app.js"></script>','<script>\n'+rd('src/app.js')+'</script>').replace('<script src="src/ui.js"></script>','<script>\n'+rd('src/ui.js')+'</script>')
o=sys.argv[1] if len(sys.argv)>1 else 'dist/civic-track.html'
os.makedirs(os.path.dirname(os.path.abspath(o)),exist_ok=True);open(o,'w',encoding='utf-8').write(h)
